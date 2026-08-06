import { Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { getExternalCourses } from '../services/externalCourseService';

interface LearningPathStep {
  order: number;
  skillId: number;
  skillName: string;
  priority: 'High' | 'Medium' | 'Low';
  currentProficiency: number;
  requiredProficiency: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  source: 'Internal' | 'External';
  courseTitle: string;
  provider: string;
  durationHours: number;
  url: string | null;
}

// Maps how far behind an employee is on a skill to which difficulty level
// of course they should start with (Task 4: "Arrange courses from
// beginner to advanced").
function levelForGap(currentProficiency: number, requiredProficiency: number): 'Beginner' | 'Intermediate' | 'Advanced' {
  if (currentProficiency <= 1) return 'Beginner';
  if (currentProficiency < requiredProficiency - 1) return 'Intermediate';
  return 'Advanced';
}

/**
 * Builds a personalized, ordered learning roadmap for one employee.
 * Ordering rule (Task 6: "Recommend courses based on missing skills,
 * skill priority, user role, current proficiency level"):
 *   1. High priority gaps first, then Medium, then Low
 *   2. Within the same priority, larger deficits first
 *   3. Each step defaults to an internal training program if one exists
 *      for that skill; otherwise falls back to the external catalog.
 */
export const getLearningPath = async (req: AuthRequest, res: Response) => {
  const employeeId = Number(req.params.employeeId);
  const emp = db.employees.find(e => e.id === employeeId);

  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  db.recalculateAllGaps();

  const gaps = db.knowledgeGaps
    .filter(g => g.employee_id === employeeId && g.status !== 'Resolved')
    .sort((a, b) => {
      const priorityWeight = { High: 3, Medium: 2, Low: 1 };
      const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (pDiff !== 0) return pDiff;
      return b.gap_score - a.gap_score;
    });

  const steps: LearningPathStep[] = [];
  let order = 1;

  for (const gap of gaps) {
    const skill = db.skills.find(s => s.id === gap.skill_id);
    if (!skill) continue;

    const level = levelForGap(gap.current_proficiency, gap.required_proficiency);

    // Prefer an internal training program targeting this exact skill.
    const internalProgram = db.trainingPrograms.find(
      tp => tp.target_skill_id === gap.skill_id && tp.status === 'Active'
    );

    if (internalProgram) {
      steps.push({
        order: order++,
        skillId: skill.id,
        skillName: skill.name,
        priority: gap.priority,
        currentProficiency: gap.current_proficiency,
        requiredProficiency: gap.required_proficiency,
        level,
        source: 'Internal',
        courseTitle: internalProgram.title,
        provider: internalProgram.provider,
        durationHours: internalProgram.duration_hours,
        url: null,
      });
    } else {
      // Fall back to the external catalog, matched to the right difficulty.
      const externalCourses = await getExternalCourses(skill.name, level);
      const course = externalCourses[0] ?? (await getExternalCourses(skill.name))[0];
      if (course) {
        steps.push({
          order: order++,
          skillId: skill.id,
          skillName: skill.name,
          priority: gap.priority,
          currentProficiency: gap.current_proficiency,
          requiredProficiency: gap.required_proficiency,
          level: course.level,
          source: 'External',
          courseTitle: course.title,
          provider: course.provider,
          durationHours: course.durationHours,
          url: course.url,
        });
      }
    }
  }

  const totalHours = steps.reduce((sum, s) => sum + s.durationHours, 0);
  // Rough estimate assuming ~5 focused learning hours per week.
  const estimatedWeeks = Math.max(1, Math.ceil(totalHours / 5));

  return res.json({
    success: true,
    data: {
      employeeId,
      employeeName: `${emp.first_name} ${emp.last_name}`,
      designation: emp.designation,
      totalSteps: steps.length,
      totalHours,
      estimatedWeeks,
      steps,
    },
  });
};

/** Convenience endpoint: the logged-in user's own learning path. */
export const getMyLearningPath = async (req: AuthRequest, res: Response) => {
  const employeeId = req.user?.employeeId ?? db.employees.find(e => e.user_id === req.user?.id)?.id;
  if (!employeeId) {
    return res.status(404).json({ success: false, message: 'No employee profile linked to this account' });
  }
  req.params.employeeId = String(employeeId);
  return getLearningPath(req, res);
};
