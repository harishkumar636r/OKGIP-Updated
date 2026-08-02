import { Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getTrainings = (req: AuthRequest, res: Response) => {
  const list = db.trainingPrograms.map(tp => {
    const skill = db.skills.find(s => s.id === tp.target_skill_id);
    const assignments = db.trainingAssignments.filter(ta => ta.training_program_id === tp.id);
    const completed = assignments.filter(ta => ta.status === 'Completed').length;

    return {
      ...tp,
      target_skill_name: skill ? skill.name : 'Unknown Skill',
      total_enrolled: assignments.length,
      completed_count: completed,
      completion_rate: assignments.length > 0 ? Math.round((completed / assignments.length) * 100) : 0,
    };
  });

  return res.json({ success: true, count: list.length, data: list });
};

export const createTraining = (req: AuthRequest, res: Response) => {
  const { title, description, category, targetSkillId, minProficiencyGain, durationHours, provider } = req.body;

  if (!title || !targetSkillId || !category) {
    return res.status(400).json({ success: false, message: 'Title, category, and target skill ID are required' });
  }

  const now = new Date().toISOString();
  const newId = db.trainingPrograms.length ? Math.max(...db.trainingPrograms.map(p => p.id)) + 1 : 1;

  const newProgram = {
    id: newId,
    title,
    description: description || '',
    category,
    target_skill_id: Number(targetSkillId),
    min_proficiency_gain: Number(minProficiencyGain || 1),
    duration_hours: Number(durationHours || 10),
    provider: provider || 'OKGIP Academy',
    status: 'Active' as const,
    created_at: now,
  };

  db.trainingPrograms.push(newProgram);

  return res.status(201).json({ success: true, message: 'Training program created', data: newProgram });
};

export const getAssignments = (req: AuthRequest, res: Response) => {
  let list = db.trainingAssignments.map(ta => {
    const tp = db.trainingPrograms.find(p => p.id === ta.training_program_id);
    const emp = db.employees.find(e => e.id === ta.employee_id);
    const dept = emp ? db.departments.find(d => d.id === emp.department_id) : null;
    const skill = tp ? db.skills.find(s => s.id === tp.target_skill_id) : null;

    return {
      ...ta,
      program_title: tp ? tp.title : 'Unknown Program',
      program_category: tp ? tp.category : 'General',
      duration_hours: tp ? tp.duration_hours : 0,
      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown Employee',
      employee_email: emp ? emp.email : '',
      department_name: dept ? dept.name : 'Unassigned',
      target_skill_name: skill ? skill.name : 'General Competency',
    };
  });

  const { employeeId, status } = req.query;
  if (employeeId) {
    list = list.filter(ta => ta.employee_id === Number(employeeId));
  }
  if (status) {
    list = list.filter(ta => ta.status === status);
  }

  return res.json({ success: true, count: list.length, data: list });
};

export const assignTraining = (req: AuthRequest, res: Response) => {
  const { trainingProgramId, employeeId, dueDate } = req.body;

  if (!trainingProgramId || !employeeId || !dueDate) {
    return res.status(400).json({ success: false, message: 'Program, employee, and due date required' });
  }

  const tp = db.trainingPrograms.find(p => p.id === Number(trainingProgramId));
  const emp = db.employees.find(e => e.id === Number(employeeId));

  if (!tp || !emp) {
    return res.status(404).json({ success: false, message: 'Training program or employee not found' });
  }

  const existing = db.trainingAssignments.find(
    ta => ta.training_program_id === tp.id && ta.employee_id === emp.id && ta.status !== 'Completed'
  );

  if (existing) {
    return res.status(400).json({ success: false, message: 'Employee is already enrolled in this active training program' });
  }

  const now = new Date().toISOString();
  const newId = db.trainingAssignments.length ? Math.max(...db.trainingAssignments.map(a => a.id)) + 1 : 1;

  const newAssignment = {
    id: newId,
    training_program_id: tp.id,
    employee_id: emp.id,
    assigned_by: req.user ? req.user.id : null,
    assigned_date: now.split('T')[0],
    due_date: dueDate,
    status: 'Assigned' as const,
    progress_percentage: 0,
    certificate_url: null,
    completed_at: null,
    created_at: now,
    updated_at: now,
  };

  db.trainingAssignments.push(newAssignment);

  // Send notification
  if (emp.user_id) {
    db.notifications.push({
      id: db.notifications.length ? Math.max(...db.notifications.map(n => n.id)) + 1 : 1,
      user_id: emp.user_id,
      title: 'New Training Assigned',
      message: `You have been assigned to ${tp.title} due on ${dueDate}.`,
      type: 'Training Assigned',
      is_read: false,
      created_at: now,
    });
  }

  db.recalculateAllGaps();

  return res.status(201).json({ success: true, message: 'Training program assigned', data: newAssignment });
};

export const updateAssignmentProgress = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { progressPercentage } = req.body;

  const assignment = db.trainingAssignments.find(ta => ta.id === Number(id));
  if (!assignment) {
    return res.status(404).json({ success: false, message: 'Assignment not found' });
  }

  const percentage = Math.min(100, Math.max(0, Number(progressPercentage)));
  assignment.progress_percentage = percentage;
  assignment.updated_at = new Date().toISOString();

  if (percentage > 0 && percentage < 100) {
    assignment.status = 'In Progress';
  } else if (percentage === 100) {
    assignment.status = 'Completed';
    assignment.completed_at = new Date().toISOString();
    assignment.certificate_url = `CERT-OKGIP-${assignment.id}-${Date.now().toString().slice(-6)}`;

    // Upgrade employee skill
    const tp = db.trainingPrograms.find(p => p.id === assignment.training_program_id);
    if (tp) {
      const empSkill = db.employeeSkills.find(es => es.employee_id === assignment.employee_id && es.skill_id === tp.target_skill_id);
      if (empSkill) {
        empSkill.current_proficiency = Math.min(5, empSkill.current_proficiency + tp.min_proficiency_gain);
      } else {
        db.employeeSkills.push({
          id: db.employeeSkills.length ? Math.max(...db.employeeSkills.map(s => s.id)) + 1 : 1,
          employee_id: assignment.employee_id,
          skill_id: tp.target_skill_id,
          current_proficiency: Math.min(5, 1 + tp.min_proficiency_gain),
          assessed_date: new Date().toISOString().split('T')[0],
          verified_by: 'Automated Training Completion',
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  db.recalculateAllGaps();

  return res.json({ success: true, message: 'Progress updated', data: assignment });
};
