import { Response } from 'express';
import { db } from '../config/db';
import { queryAsync } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';

// Persists the current in-memory gap analysis snapshot to MySQL so results
// are durable and queryable outside this Node process too (Task 1:
// "Store the gap analysis results in the database"). This is best-effort —
// queryAsync() resolves to null instead of throwing if MySQL is
// unavailable, so this never breaks the API response if the DB is down.
const persistGapSnapshot = async () => {
  for (const g of db.knowledgeGaps) {
    await queryAsync(
      `INSERT INTO knowledge_gaps (id, employee_id, skill_id, current_level, required_level, priority, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE current_level = VALUES(current_level), required_level = VALUES(required_level),
         priority = VALUES(priority), status = VALUES(status)`,
      [
        g.id,
        g.employee_id,
        g.skill_id,
        g.current_proficiency,
        g.required_proficiency,
        g.priority.toUpperCase(),
        g.status === 'In Training' ? 'IN_TRAINING' : g.status === 'Resolved' ? 'RESOLVED' : 'IDENTIFIED',
        g.created_at,
      ]
    );
  }
};

export const getKnowledgeGaps = (req: AuthRequest, res: Response) => {
  db.recalculateAllGaps();
  persistGapSnapshot().catch(() => {}); // fire-and-forget, never blocks the response

  let gaps = db.knowledgeGaps.map(g => {
    const emp = db.employees.find(e => e.id === g.employee_id);
    const dept = emp ? db.departments.find(d => d.id === emp.department_id) : null;
    const skill = db.skills.find(s => s.id === g.skill_id);
    const percentage = Math.round((g.current_proficiency / g.required_proficiency) * 100);

    const recommendedProgram = db.trainingPrograms.find(
      tp => tp.target_skill_id === g.skill_id && tp.status === 'Active'
    );

    return {
      ...g,
      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
      employee_designation: emp ? emp.designation : 'N/A',
      employee_photo: emp ? emp.photo_url : null,
      department_name: dept ? dept.name : 'Unassigned',
      skill_name: skill ? skill.name : 'Unknown',
      skill_category: skill ? skill.category : 'Technical',
      competency_percentage: percentage,
      recommended_training: recommendedProgram
        ? {
            id: recommendedProgram.id,
            title: recommendedProgram.title,
            duration_hours: recommendedProgram.duration_hours,
            provider: recommendedProgram.provider,
          }
        : null,
    };
  });

  const { priority, status, departmentId, employeeId, search } = req.query;

  if (priority) {
    gaps = gaps.filter(g => g.priority === priority);
  }
  if (status) {
    gaps = gaps.filter(g => g.status === status);
  }
  if (departmentId) {
    const empIds = db.employees.filter(e => e.department_id === Number(departmentId)).map(e => e.id);
    gaps = gaps.filter(g => empIds.includes(g.employee_id));
  }
  if (employeeId) {
    gaps = gaps.filter(g => g.employee_id === Number(employeeId));
  }
  if (search) {
    const q = String(search).toLowerCase();
    gaps = gaps.filter(
      g =>
        g.employee_name.toLowerCase().includes(q) ||
        g.skill_name.toLowerCase().includes(q) ||
        g.department_name.toLowerCase().includes(q)
    );
  }

  return res.json({ success: true, count: gaps.length, data: gaps });
};

export const getGapAnalytics = (req: AuthRequest, res: Response) => {
  db.recalculateAllGaps();

  const totalEmployees = db.employees.length;
  const totalDepartments = db.departments.length;
  const totalSkills = db.skills.length;
  const allGaps = db.knowledgeGaps;

  const totalGaps = allGaps.length;
  const highPriorityGaps = allGaps.filter(g => g.priority === 'High').length;
  const mediumPriorityGaps = allGaps.filter(g => g.priority === 'Medium').length;
  const lowPriorityGaps = allGaps.filter(g => g.priority === 'Low').length;
  const inTrainingCount = allGaps.filter(g => g.status === 'In Training').length;

  const avgGapScore = totalGaps > 0
    ? (allGaps.reduce((sum, g) => sum + g.gap_score, 0) / totalGaps).toFixed(2)
    : '0.00';

  // Department gap breakdown
  const departmentBreakdown = db.departments.map(d => {
    const emps = db.employees.filter(e => e.department_id === d.id).map(e => e.id);
    const dGaps = allGaps.filter(g => emps.includes(g.employee_id));
    return {
      department_id: d.id,
      department_name: d.name,
      total_gaps: dGaps.length,
      high_gaps: dGaps.filter(g => g.priority === 'High').length,
    };
  });

  // Skill deficiency ranking
  const skillDeficiencies = db.skills.map(s => {
    const sGaps = allGaps.filter(g => g.skill_id === s.id);
    return {
      skill_id: s.id,
      skill_name: s.name,
      category: s.category,
      gap_count: sGaps.length,
      avg_deficit: sGaps.length > 0 ? (sGaps.reduce((sum, g) => sum + g.gap_score, 0) / sGaps.length).toFixed(1) : 0,
    };
  }).sort((a, b) => b.gap_count - a.gap_count);

  return res.json({
    success: true,
    data: {
      metrics: {
        totalEmployees,
        totalDepartments,
        totalSkills,
        totalGaps,
        highPriorityGaps,
        mediumPriorityGaps,
        lowPriorityGaps,
        inTrainingCount,
        avgGapScore: Number(avgGapScore),
      },
      departmentBreakdown,
      skillDeficiencies,
    },
  });
};

// Task 2 data source: employee x skill matrix for the heatmap
// visualization, with full numeric detail per cell (current, required,
// deficit) so the frontend tooltip and color gradient can be precise
// rather than just a 4-bucket severity label.
export const getGapHeatmap = (req: AuthRequest, res: Response) => {
  db.recalculateAllGaps();

  const { departmentId } = req.query;
  let employees = db.employees.filter(e => e.status === 'Active');
  if (departmentId) {
    employees = employees.filter(e => e.department_id === Number(departmentId));
  }

  // Only include skills that are actually required somewhere, so the
  // heatmap doesn't show empty columns for irrelevant skills.
  const requiredSkillIds = Array.from(new Set(db.departmentRequiredSkills.map(r => r.skill_id)));
  const skills = db.skills.filter(s => requiredSkillIds.includes(s.id));

  const matrix = employees.map(emp => {
    const dept = db.departments.find(d => d.id === emp.department_id);
    const deptReqs = db.departmentRequiredSkills.filter(r => r.department_id === emp.department_id);

    let scoredCells = 0;
    let scoreSum = 0;

    const cells = skills.map(skill => {
      const requirement = deptReqs.find(r => r.skill_id === skill.id);
      const applicable = !!requirement;
      const empSkill = db.employeeSkills.find(es => es.employee_id === emp.id && es.skill_id === skill.id);
      const current = empSkill ? empSkill.current_proficiency : 0;
      const required = requirement ? requirement.required_proficiency : 0;
      const deficit = applicable ? Math.max(0, required - current) : 0;

      if (applicable) {
        scoredCells++;
        scoreSum += Math.min(1, current / Math.max(1, required));
      }

      let severity: 'none' | 'low' | 'medium' | 'high' | 'expert' | 'na' = 'na';
      if (applicable) {
        if (deficit >= 3) severity = 'high';
        else if (deficit === 2) severity = 'high';
        else if (deficit === 1) severity = 'medium';
        else if (current > required) severity = 'expert';
        else severity = 'none';
      }

      return {
        skillId: skill.id,
        skillName: skill.name,
        current,
        required,
        deficit,
        applicable,
        severity,
      };
    });

    const overallScore = scoredCells > 0 ? Math.round((scoreSum / scoredCells) * 100) : 100;

    return {
      employeeId: emp.id,
      employeeName: `${emp.first_name} ${emp.last_name}`,
      designation: emp.designation,
      departmentId: emp.department_id,
      departmentName: dept ? dept.name : 'Unassigned',
      overallScore,
      cells,
    };
  });

  const criticalCells = matrix.flatMap(r => r.cells).filter(c => c.applicable && c.deficit >= 2).length;
  const moderateCells = matrix.flatMap(r => r.cells).filter(c => c.applicable && c.deficit === 1).length;
  const onTargetOrBetter = matrix.flatMap(r => r.cells).filter(c => c.applicable && c.deficit === 0).length;
  const totalApplicableCells = matrix.flatMap(r => r.cells).filter(c => c.applicable).length;
  const workforceCoverage = totalApplicableCells > 0
    ? Math.round((onTargetOrBetter / totalApplicableCells) * 100)
    : 100;

  return res.json({
    success: true,
    data: {
      skills: skills.map(s => ({ id: s.id, name: s.name, category: s.category })),
      employees: matrix,
      summary: {
        totalEmployees: employees.length,
        totalDepartments: db.departments.length,
        totalSkills: skills.length,
        criticalGaps: criticalCells,
        moderateGaps: moderateCells,
        workforceCoverage,
      },
    },
  });
};

export const resolveGap = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const gap = db.knowledgeGaps.find(g => g.id === Number(id));

  if (!gap) {
    return res.status(404).json({ success: false, message: 'Gap record not found' });
  }

  gap.status = 'Resolved';
  gap.updated_at = new Date().toISOString();

  // Update employee skill proficiency to required level
  const empSkill = db.employeeSkills.find(es => es.employee_id === gap.employee_id && es.skill_id === gap.skill_id);
  if (empSkill) {
    empSkill.current_proficiency = gap.required_proficiency;
  }

  return res.json({ success: true, message: 'Gap marked as resolved and competency updated' });
};
