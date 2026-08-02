import { Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getEmployeeReport = (req: AuthRequest, res: Response) => {
  const data = db.employees.map(emp => {
    const dept = db.departments.find(d => d.id === emp.department_id);
    const skills = db.employeeSkills.filter(es => es.employee_id === emp.id).map(es => {
      const s = db.skills.find(sk => sk.id === es.skill_id);
      return {
        skill_name: s ? s.name : 'Unknown',
        category: s ? s.category : 'General',
        proficiency: es.current_proficiency,
      };
    });
    const gaps = db.knowledgeGaps.filter(g => g.employee_id === emp.id);
    const trainings = db.trainingAssignments.filter(ta => ta.employee_id === emp.id);

    return {
      id: emp.id,
      employee_name: `${emp.first_name} ${emp.last_name}`,
      email: emp.email,
      designation: emp.designation,
      department: dept ? dept.name : 'Unassigned',
      status: emp.status,
      join_date: emp.join_date,
      skills_count: skills.length,
      skills_list: skills,
      gaps_count: gaps.length,
      high_gaps_count: gaps.filter(g => g.priority === 'High').length,
      trainings_completed: trainings.filter(t => t.status === 'Completed').length,
      trainings_in_progress: trainings.filter(t => t.status === 'In Progress').length,
    };
  });

  return res.json({
    success: true,
    generated_at: new Date().toISOString(),
    report_title: 'Employee Competency & Skills Master Report',
    data,
  });
};

export const getGapReport = (req: AuthRequest, res: Response) => {
  db.recalculateAllGaps();

  const data = db.knowledgeGaps.map(g => {
    const emp = db.employees.find(e => e.id === g.employee_id);
    const dept = emp ? db.departments.find(d => d.id === emp.department_id) : null;
    const skill = db.skills.find(s => s.id === g.skill_id);

    return {
      id: g.id,
      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
      department: dept ? dept.name : 'Unassigned',
      skill_name: skill ? skill.name : 'Unknown',
      category: skill ? skill.category : 'Technical',
      required_proficiency: g.required_proficiency,
      current_proficiency: g.current_proficiency,
      gap_score: g.gap_score,
      priority: g.priority,
      status: g.status,
      created_at: g.created_at,
    };
  });

  return res.json({
    success: true,
    generated_at: new Date().toISOString(),
    report_title: 'Organizational Knowledge Gap Analysis Report',
    summary: {
      total_gaps: data.length,
      high_priority: data.filter(d => d.priority === 'High').length,
      medium_priority: data.filter(d => d.priority === 'Medium').length,
      low_priority: data.filter(d => d.priority === 'Low').length,
      resolved: data.filter(d => d.status === 'Resolved').length,
    },
    data,
  });
};

export const getTrainingReport = (req: AuthRequest, res: Response) => {
  const data = db.trainingAssignments.map(ta => {
    const tp = db.trainingPrograms.find(p => p.id === ta.training_program_id);
    const emp = db.employees.find(e => e.id === ta.employee_id);
    const dept = emp ? db.departments.find(d => d.id === emp.department_id) : null;

    return {
      id: ta.id,
      program_title: tp ? tp.title : 'Unknown',
      category: tp ? tp.category : 'General',
      provider: tp ? tp.provider : 'N/A',
      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
      department: dept ? dept.name : 'Unassigned',
      assigned_date: ta.assigned_date,
      due_date: ta.due_date,
      status: ta.status,
      progress_percentage: ta.progress_percentage,
      completed_at: ta.completed_at || 'Pending',
    };
  });

  return res.json({
    success: true,
    generated_at: new Date().toISOString(),
    report_title: 'Training & Employee Development Analytics Report',
    summary: {
      total_assignments: data.length,
      completed: data.filter(d => d.status === 'Completed').length,
      in_progress: data.filter(d => d.status === 'In Progress').length,
      assigned: data.filter(d => d.status === 'Assigned').length,
    },
    data,
  });
};
