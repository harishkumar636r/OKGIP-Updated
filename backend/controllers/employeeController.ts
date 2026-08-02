import { Response } from 'express';
import { db } from '../config/db';
import { queryAsync } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';

export const getEmployees = (req: AuthRequest, res: Response) => {
  let list = db.employees.map(e => {
    const dept = db.departments.find(d => d.id === e.department_id);
    const skills = db.employeeSkills.filter(es => es.employee_id === e.id).map(es => {
      const s = db.skills.find(sk => sk.id === es.skill_id);
      return {
        ...es,
        skill_name: s ? s.name : 'Unknown',
        category: s ? s.category : 'Technical',
      };
    });
    const gaps = db.knowledgeGaps.filter(g => g.employee_id === e.id);
    return {
      ...e,
      department_name: dept ? dept.name : 'Unassigned',
      skills_count: skills.length,
      gaps_count: gaps.length,
      high_gaps_count: gaps.filter(g => g.priority === 'High').length,
    };
  });

  // Filter by department if requested
  const { departmentId, search, status } = req.query;
  if (departmentId) {
    list = list.filter(e => e.department_id === Number(departmentId));
  }
  if (status) {
    list = list.filter(e => e.status === status);
  }
  if (search) {
    const query = String(search).toLowerCase();
    list = list.filter(e =>
      e.first_name.toLowerCase().includes(query) ||
      e.last_name.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query) ||
      e.designation.toLowerCase().includes(query)
    );
  }

  return res.json({ success: true, count: list.length, data: list });
};

export const getEmployeeById = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const employee = db.employees.find(e => e.id === Number(id));

  if (!employee) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  const department = db.departments.find(d => d.id === employee.department_id);
  const skills = db.employeeSkills
    .filter(es => es.employee_id === employee.id)
    .map(es => {
      const s = db.skills.find(sk => sk.id === es.skill_id);
      return {
        ...es,
        skill: s,
      };
    });

  const gaps = db.knowledgeGaps
    .filter(g => g.employee_id === employee.id)
    .map(g => {
      const s = db.skills.find(sk => sk.id === g.skill_id);
      return {
        ...g,
        skill_name: s ? s.name : 'Unknown',
      };
    });

  const trainingAssignments = db.trainingAssignments
    .filter(ta => ta.employee_id === employee.id)
    .map(ta => {
      const tp = db.trainingPrograms.find(p => p.id === ta.training_program_id);
      return {
        ...ta,
        program_title: tp ? tp.title : 'Unknown Program',
        category: tp ? tp.category : 'General',
      };
    });

  return res.json({
    success: true,
    data: {
      ...employee,
      department,
      skills,
      gaps,
      trainingAssignments,
    },
  });
};

export const createEmployee = async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, email, phone, designation, departmentId, joinDate, status } = req.body;

  if (!firstName || !lastName || !email || !designation) {
    return res.status(400).json({ success: false, message: 'Required fields missing' });
  }

  const existing = db.employees.find(e => e.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Employee email already registered' });
  }

  const now = new Date().toISOString();
  const newUserId = db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const newEmpId = db.employees.length ? Math.max(...db.employees.map(e => e.id)) + 1 : 1;

  const newUser = {
    id: newUserId,
    email: email.trim().toLowerCase(),
    password_hash: '$2a$10$7R4d4Y3kPZ3X9aL/J/4bEOjCgJb01I3M8E.w1V8e7q8b8y6Z6r6.C',
    role: 'Employee' as const,
    created_at: now,
    updated_at: now,
  };
  db.users.push(newUser);

  const newEmp = {
    id: newEmpId,
    user_id: newUserId,
    first_name: firstName,
    last_name: lastName,
    email: email.trim().toLowerCase(),
    phone: phone || '+1-800-555-0199',
    designation,
    department_id: departmentId ? Number(departmentId) : null,
    join_date: joinDate || new Date().toISOString().split('T')[0],
    photo_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
    status: (status as any) || 'Active',
    created_at: now,
    updated_at: now,
  };

  db.employees.push(newEmp);
  db.recalculateAllGaps();

  // Persist to MySQL database
  await queryAsync(
    'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE email=VALUES(email)',
    [newUser.id, newUser.email, newUser.password_hash, newUser.role]
  );

  await queryAsync(
    'INSERT INTO employees (id, user_id, first_name, last_name, email, phone, designation, department_id, join_date, photo_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email=VALUES(email)',
    [newEmp.id, newEmp.user_id, newEmp.first_name, newEmp.last_name, newEmp.email, newEmp.phone, newEmp.designation, newEmp.department_id, newEmp.join_date, newEmp.photo_url, newEmp.status]
  );

  return res.status(201).json({ success: true, message: 'Employee created', data: newEmp });
};

export const updateEmployee = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const emp = db.employees.find(e => e.id === Number(id));

  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  const { firstName, lastName, phone, designation, departmentId, status } = req.body;

  if (firstName) emp.first_name = firstName;
  if (lastName) emp.last_name = lastName;
  if (phone) emp.phone = phone;
  if (designation) emp.designation = designation;
  if (departmentId !== undefined) emp.department_id = departmentId ? Number(departmentId) : null;
  if (status) emp.status = status;
  emp.updated_at = new Date().toISOString();

  db.recalculateAllGaps();

  // Update in MySQL database
  await queryAsync(
    'UPDATE employees SET first_name=?, last_name=?, phone=?, designation=?, department_id=?, status=? WHERE id=?',
    [emp.first_name, emp.last_name, emp.phone, emp.designation, emp.department_id, emp.status, emp.id]
  );

  return res.json({ success: true, message: 'Employee updated', data: emp });
};

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = db.employees.findIndex(e => e.id === Number(id));

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  const emp = db.employees[index];
  db.employees.splice(index, 1);

  // Clean up user
  const uIdx = db.users.findIndex(u => u.id === emp.user_id);
  if (uIdx !== -1) db.users.splice(uIdx, 1);

  // Clean up employee skills
  db.employeeSkills = db.employeeSkills.filter(es => es.employee_id !== emp.id);

  db.recalculateAllGaps();

  // Delete from MySQL database
  await queryAsync('DELETE FROM employees WHERE id=?', [emp.id]);
  await queryAsync('DELETE FROM users WHERE id=?', [emp.user_id]);

  return res.json({ success: true, message: 'Employee removed successfully' });
};
