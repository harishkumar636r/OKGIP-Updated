import { Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getSkills = (req: AuthRequest, res: Response) => {
  const list = db.skills.map(s => {
    const assessedCount = db.employeeSkills.filter(es => es.skill_id === s.id).length;
    const requiredInDepts = db.departmentRequiredSkills
      .filter(drs => drs.skill_id === s.id)
      .map(drs => {
        const d = db.departments.find(dept => dept.id === drs.department_id);
        return d ? d.name : 'Unknown';
      });

    const activeGaps = db.knowledgeGaps.filter(g => g.skill_id === s.id);

    return {
      ...s,
      assessed_employees_count: assessedCount,
      required_in_departments: requiredInDepts,
      gap_count: activeGaps.length,
      high_priority_gaps: activeGaps.filter(g => g.priority === 'High').length,
    };
  });

  const { category, search } = req.query;
  let filtered = list;
  if (category) {
    filtered = filtered.filter(s => s.category === category);
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }

  return res.json({ success: true, count: filtered.length, data: filtered });
};

export const createSkill = (req: AuthRequest, res: Response) => {
  const { name, category, description } = req.body;

  if (!name || !category) {
    return res.status(400).json({ success: false, message: 'Skill name and category are required' });
  }

  const existing = db.skills.find(s => s.name.toLowerCase() === name.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Skill already exists' });
  }

  const now = new Date().toISOString();
  const newId = db.skills.length ? Math.max(...db.skills.map(s => s.id)) + 1 : 1;

  const newSkill = {
    id: newId,
    name: name.trim(),
    category,
    description: description || '',
    created_at: now,
    updated_at: now,
  };

  db.skills.push(newSkill);

  return res.status(201).json({ success: true, message: 'Skill added', data: newSkill });
};

export const updateSkill = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const s = db.skills.find(sk => sk.id === Number(id));

  if (!s) {
    return res.status(404).json({ success: false, message: 'Skill not found' });
  }

  const { name, category, description } = req.body;

  if (name) s.name = name;
  if (category) s.category = category;
  if (description !== undefined) s.description = description;
  s.updated_at = new Date().toISOString();

  return res.json({ success: true, message: 'Skill updated', data: s });
};

export const deleteSkill = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = db.skills.findIndex(s => s.id === Number(id));

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Skill not found' });
  }

  db.skills.splice(index, 1);
  db.employeeSkills = db.employeeSkills.filter(es => es.skill_id !== Number(id));
  db.departmentRequiredSkills = db.departmentRequiredSkills.filter(drs => drs.skill_id !== Number(id));
  db.recalculateAllGaps();

  return res.json({ success: true, message: 'Skill deleted' });
};

export const assignEmployeeSkill = (req: AuthRequest, res: Response) => {
  const { employeeId, skillId, currentProficiency, verifiedBy } = req.body;

  if (!employeeId || !skillId || !currentProficiency) {
    return res.status(400).json({ success: false, message: 'Employee ID, Skill ID, and Proficiency level (1-5) required' });
  }

  const emp = db.employees.find(e => e.id === Number(employeeId));
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  const existingIdx = db.employeeSkills.findIndex(es => es.employee_id === Number(employeeId) && es.skill_id === Number(skillId));
  const now = new Date().toISOString();

  if (existingIdx !== -1) {
    db.employeeSkills[existingIdx].current_proficiency = Number(currentProficiency);
    db.employeeSkills[existingIdx].assessed_date = now.split('T')[0];
    db.employeeSkills[existingIdx].verified_by = verifiedBy || 'Assessor';
  } else {
    const newId = db.employeeSkills.length ? Math.max(...db.employeeSkills.map(es => es.id)) + 1 : 1;
    db.employeeSkills.push({
      id: newId,
      employee_id: Number(employeeId),
      skill_id: Number(skillId),
      current_proficiency: Number(currentProficiency),
      assessed_date: now.split('T')[0],
      verified_by: verifiedBy || 'Assessor',
      created_at: now,
    });
  }

  db.recalculateAllGaps();

  return res.json({ success: true, message: 'Employee skill assessment updated successfully' });
};
