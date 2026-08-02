import { Request, Response } from 'express';
import { db } from '../config/db';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || '').toLowerCase().trim();
    if (!query) {
      return res.json({ success: true, data: [] });
    }

    const results: any[] = [];

    // Search Employees
    db.employees.forEach((emp) => {
      const name = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      if (name.includes(query) || emp.designation.toLowerCase().includes(query) || emp.email.toLowerCase().includes(query)) {
        results.push({
          type: 'Employee',
          id: emp.id,
          title: `${emp.first_name} ${emp.last_name}`,
          subtitle: `${emp.designation} (${emp.email})`,
          path: `/employees?id=${emp.id}`,
        });
      }
    });

    // Search Departments
    db.departments.forEach((dept) => {
      if (dept.name.toLowerCase().includes(query) || dept.code.toLowerCase().includes(query)) {
        results.push({
          type: 'Department',
          id: dept.id,
          title: dept.name,
          subtitle: `Code: ${dept.code} - ${dept.description}`,
          path: '/departments',
        });
      }
    });

    // Search Skills
    db.skills.forEach((sk) => {
      if (sk.name.toLowerCase().includes(query) || sk.category.toLowerCase().includes(query)) {
        results.push({
          type: 'Skill',
          id: sk.id,
          title: sk.name,
          subtitle: `Category: ${sk.category}`,
          path: '/skills',
        });
      }
    });

    // Search Training Programs
    db.trainingPrograms.forEach((tp) => {
      if (tp.title.toLowerCase().includes(query) || tp.category.toLowerCase().includes(query)) {
        results.push({
          type: 'Training',
          id: tp.id,
          title: tp.title,
          subtitle: `${tp.provider} (${tp.duration_hours} hrs)`,
          path: '/training',
        });
      }
    });

    // Search Tasks
    db.tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(query) || t.employee_name.toLowerCase().includes(query)) {
        results.push({
          type: 'Task',
          id: t.id,
          title: t.title,
          subtitle: `Assigned to ${t.employee_name} [${t.priority} Priority]`,
          path: '/tasks',
        });
      }
    });

    // Search Leave Requests
    db.leaveRequests.forEach((l) => {
      if (l.employee_name.toLowerCase().includes(query) || l.leave_type.toLowerCase().includes(query)) {
        results.push({
          type: 'Leave Request',
          id: l.id,
          title: `${l.employee_name} - ${l.leave_type} Leave`,
          subtitle: `Status: ${l.status} (${l.start_date} to ${l.end_date})`,
          path: '/leave',
        });
      }
    });

    res.json({ success: true, data: results.slice(0, 15) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
