import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { queryAsync } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    // Query users directly from MySQL with employee join
    const rows = await queryAsync(`
      SELECT u.id, u.email, u.role, u.created_at, u.updated_at,
             e.id as employee_id, e.first_name, e.last_name, e.designation, e.department_id, e.phone, e.photo_url, e.status
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      ORDER BY u.id ASC
    `);

    const users = (rows || []).map((r: any) => ({
      id: r.id,
      email: r.email,
      role: r.role,
      created_at: r.created_at || new Date().toISOString(),
      employee: r.employee_id
        ? {
            id: r.employee_id,
            first_name: r.first_name,
            last_name: r.last_name,
            designation: r.designation,
            department_id: r.department_id,
            phone: r.phone,
            photo_url: r.photo_url,
            status: r.status,
          }
        : null,
    }));

    return res.json({ success: true, count: users.length, data: users });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch users' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, role, firstName, lastName, designation, departmentId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Email, password, first name and last name are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    const existing = await queryAsync('SELECT id FROM users WHERE LOWER(email)=?', [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const now = new Date().toISOString();
    const password_hash = bcrypt.hashSync(password, 10);
    const userRole = ['Admin', 'Manager', 'Employee'].includes(role) ? role : 'Employee';

    // Insert user
    const userMaxRows = await queryAsync('SELECT MAX(id) as maxId FROM users');
    const newUserId = (userMaxRows?.[0]?.maxId ? Number(userMaxRows[0].maxId) : 0) + 1;

    await queryAsync(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [newUserId, cleanEmail, password_hash, userRole]
    );

    // Insert employee
    const empMaxRows = await queryAsync('SELECT MAX(id) as maxId FROM employees');
    const newEmpId = (empMaxRows?.[0]?.maxId ? Number(empMaxRows[0].maxId) : 0) + 1;

    const empDeptId = departmentId ? Number(departmentId) : 1;
    const empDesignation = designation || (userRole === 'Admin' ? 'Administrator' : userRole === 'Manager' ? 'Manager' : 'Specialist');

    await queryAsync(
      'INSERT INTO employees (id, user_id, first_name, last_name, email, phone, designation, department_id, join_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newEmpId, newUserId, firstName, lastName, cleanEmail, '+1-800-555-0199', empDesignation, empDeptId, new Date().toISOString().split('T')[0], 'Active']
    );

    // Sync in-memory db
    const newUser = { id: newUserId, email: cleanEmail, password_hash, role: userRole as any, created_at: now, updated_at: now };
    const newEmployee = {
      id: newEmpId,
      user_id: newUserId,
      first_name: firstName,
      last_name: lastName,
      email: cleanEmail,
      phone: '+1-800-555-0199',
      designation: empDesignation,
      department_id: empDeptId,
      join_date: new Date().toISOString().split('T')[0],
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'Active' as const,
      created_at: now,
      updated_at: now,
    };

    db.users.push(newUser);
    db.employees.push(newEmployee);

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { ...newUser, employee: newEmployee },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to create user' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, email, password, firstName, lastName, designation, departmentId, status } = req.body;

    const userId = Number(id);

    if (role && ['Admin', 'Manager', 'Employee'].includes(role)) {
      await queryAsync('UPDATE users SET role=? WHERE id=?', [role, userId]);
      const memUser = db.users.find(u => u.id === userId);
      if (memUser) memUser.role = role;
    }

    if (password && password.trim().length > 0) {
      const hash = bcrypt.hashSync(password, 10);
      await queryAsync('UPDATE users SET password_hash=? WHERE id=?', [hash, userId]);
      const memUser = db.users.find(u => u.id === userId);
      if (memUser) memUser.password_hash = hash;
    }

    if (firstName || lastName || designation || departmentId !== undefined || status || email) {
      await queryAsync(
        'UPDATE employees SET first_name=COALESCE(?, first_name), last_name=COALESCE(?, last_name), designation=COALESCE(?, designation), department_id=COALESCE(?, department_id), status=COALESCE(?, status), email=COALESCE(?, email) WHERE user_id=?',
        [firstName || null, lastName || null, designation || null, departmentId !== undefined ? Number(departmentId) : null, status || null, email || null, userId]
      );

      if (email) {
        await queryAsync('UPDATE users SET email=? WHERE id=?', [email.toLowerCase().trim(), userId]);
      }

      const memEmp = db.employees.find(e => e.user_id === userId);
      if (memEmp) {
        if (firstName) memEmp.first_name = firstName;
        if (lastName) memEmp.last_name = lastName;
        if (designation) memEmp.designation = designation;
        if (departmentId !== undefined) memEmp.department_id = Number(departmentId);
        if (status) memEmp.status = status;
        if (email) memEmp.email = email;
      }
    }

    return res.json({ success: true, message: 'User account updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to update user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    if (req.user?.id === userId) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active administrator account' });
    }

    await queryAsync('DELETE FROM employees WHERE user_id=?', [userId]);
    await queryAsync('DELETE FROM users WHERE id=?', [userId]);

    // Remove from in-memory db
    const uIdx = db.users.findIndex(u => u.id === userId);
    if (uIdx !== -1) db.users.splice(uIdx, 1);

    const eIdx = db.employees.findIndex(e => e.user_id === userId);
    if (eIdx !== -1) db.employees.splice(eIdx, 1);

    return res.json({ success: true, message: 'User and employee records deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to delete user' });
  }
};
