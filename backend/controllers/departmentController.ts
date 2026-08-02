import { Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getDepartments = (req: AuthRequest, res: Response) => {
  const depts = db.departments.map(d => {
    const head = db.employees.find(e => e.id === d.head_employee_id);
    const employeeCount = db.employees.filter(e => e.department_id === d.id).length;
    const reqSkills = db.departmentRequiredSkills
      .filter(drs => drs.department_id === d.id)
      .map(drs => {
        const s = db.skills.find(sk => sk.id === drs.skill_id);
        return {
          ...drs,
          skill_name: s ? s.name : 'Unknown',
          category: s ? s.category : 'Technical',
        };
      });

    const deptEmps = db.employees.filter(e => e.department_id === d.id).map(e => e.id);
    const deptGaps = db.knowledgeGaps.filter(g => deptEmps.includes(g.employee_id));

    return {
      ...d,
      head_name: head ? `${head.first_name} ${head.last_name}` : 'Not Assigned',
      employee_count: employeeCount,
      required_skills: reqSkills,
      active_gaps_count: deptGaps.length,
      high_priority_gaps: deptGaps.filter(g => g.priority === 'High').length,
    };
  });

  return res.json({ success: true, data: depts });
};

export const getDepartmentById = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const d = db.departments.find(dept => dept.id === Number(id));

  if (!d) {
    return res.status(404).json({ success: false, message: 'Department not found' });
  }

  const head = db.employees.find(e => e.id === d.head_employee_id);
  const employees = db.employees.filter(e => e.department_id === d.id);
  const requiredSkills = db.departmentRequiredSkills
    .filter(drs => drs.department_id === d.id)
    .map(drs => {
      const s = db.skills.find(sk => sk.id === drs.skill_id);
      return {
        ...drs,
        skill: s,
      };
    });

  return res.json({
    success: true,
    data: {
      ...d,
      head,
      employees,
      requiredSkills,
    },
  });
};

export const createDepartment = (req: AuthRequest, res: Response) => {
  const { name, code, description, headEmployeeId } = req.body;

  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Department name and code are required' });
  }

  const existing = db.departments.find(d => d.code.toUpperCase() === code.toUpperCase().trim());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Department code already exists' });
  }

  const now = new Date().toISOString();
  const newId = db.departments.length ? Math.max(...db.departments.map(d => d.id)) + 1 : 1;

  const newDept = {
    id: newId,
    name,
    code: code.toUpperCase().trim(),
    description: description || '',
    head_employee_id: headEmployeeId ? Number(headEmployeeId) : null,
    created_at: now,
    updated_at: now,
  };

  db.departments.push(newDept);

  return res.status(201).json({ success: true, message: 'Department created', data: newDept });
};

export const updateDepartment = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const d = db.departments.find(dept => dept.id === Number(id));

  if (!d) {
    return res.status(404).json({ success: false, message: 'Department not found' });
  }

  const { name, code, description, headEmployeeId, requiredSkills } = req.body;

  if (name) d.name = name;
  if (code) d.code = code.toUpperCase();
  if (description !== undefined) d.description = description;
  if (headEmployeeId !== undefined) d.head_employee_id = headEmployeeId ? Number(headEmployeeId) : null;
  d.updated_at = new Date().toISOString();

  if (Array.isArray(requiredSkills)) {
    // replace required skills for this department
    db.departmentRequiredSkills = db.departmentRequiredSkills.filter(drs => drs.department_id !== d.id);
    requiredSkills.forEach(sk => {
      db.departmentRequiredSkills.push({
        id: db.departmentRequiredSkills.length ? Math.max(...db.departmentRequiredSkills.map(r => r.id)) + 1 : 1,
        department_id: d.id,
        skill_id: Number(sk.skill_id),
        required_proficiency: Number(sk.required_proficiency || 3),
      });
    });
    db.recalculateAllGaps();
  }

  return res.json({ success: true, message: 'Department updated', data: d });
};

export const deleteDepartment = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = db.departments.findIndex(d => d.id === Number(id));

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Department not found' });
  }

  db.departments.splice(index, 1);
  // Unassign employees
  db.employees.forEach(e => {
    if (e.department_id === Number(id)) e.department_id = null;
  });

  db.recalculateAllGaps();

  return res.json({ success: true, message: 'Department deleted' });
};
