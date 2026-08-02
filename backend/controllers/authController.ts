import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { queryAsync } from '../config/mysqlDb';
import { AuthRequest, JWT_SECRET } from '../middleware/auth';

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

    // If not in memory, query MySQL
    if (!user) {
      const userRows = await queryAsync('SELECT * FROM users WHERE LOWER(email)=?', [cleanEmail]);
      if (userRows && userRows.length > 0) {
        const uRow = userRows[0];
        user = {
          id: uRow.id,
          email: uRow.email,
          password_hash: uRow.password_hash,
          role: uRow.role,
          created_at: uRow.created_at || new Date().toISOString(),
          updated_at: uRow.updated_at || new Date().toISOString(),
        };
        if (!db.users.some(u => u.id === user!.id)) {
          db.users.push(user);
        }
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    let employee = db.employees.find(e => e.user_id === user!.id);
    if (!employee) {
      const empRows = await queryAsync('SELECT * FROM employees WHERE user_id=? OR LOWER(email)=?', [user.id, cleanEmail]);
      if (empRows && empRows.length > 0) {
        const eRow = empRows[0];
        employee = {
          id: eRow.id,
          user_id: eRow.user_id,
          first_name: eRow.first_name,
          last_name: eRow.last_name,
          email: eRow.email,
          phone: eRow.phone || '',
          designation: eRow.designation,
          department_id: eRow.department_id,
          join_date: eRow.join_date,
          photo_url: eRow.photo_url || '',
          status: eRow.status,
          created_at: eRow.created_at || new Date().toISOString(),
          updated_at: eRow.updated_at || new Date().toISOString(),
        };
        if (!db.employees.some(e => e.id === employee!.id)) {
          db.employees.push(employee);
        }
      }
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: employee ? employee.id : undefined,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: employee || null,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, designation, departmentId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let existingUser = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!existingUser) {
      const dbRows = await queryAsync('SELECT * FROM users WHERE LOWER(email)=?', [cleanEmail]);
      if (dbRows && dbRows.length > 0) {
        existingUser = dbRows[0];
      }
    }

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const now = new Date().toISOString();
    const password_hash = bcrypt.hashSync(password, 10);

    const userMaxRows = await queryAsync('SELECT MAX(id) as maxId FROM users');
    const dbMaxUserId = userMaxRows && userMaxRows[0] && userMaxRows[0].maxId ? Number(userMaxRows[0].maxId) : 0;
    const memMaxUserId = db.users.length ? Math.max(...db.users.map(u => u.id)) : 0;
    const newUserId = Math.max(dbMaxUserId, memMaxUserId) + 1;

    const newUser = {
      id: newUserId,
      email: cleanEmail,
      password_hash,
      role: (role as any) || 'Employee',
      created_at: now,
      updated_at: now,
    };

    db.users.push(newUser);

    const empMaxRows = await queryAsync('SELECT MAX(id) as maxId FROM employees');
    const dbMaxEmpId = empMaxRows && empMaxRows[0] && empMaxRows[0].maxId ? Number(empMaxRows[0].maxId) : 0;
    const memMaxEmpId = db.employees.length ? Math.max(...db.employees.map(e => e.id)) : 0;
    const newEmpId = Math.max(dbMaxEmpId, memMaxEmpId) + 1;

    const newEmployee = {
      id: newEmpId,
      user_id: newUserId,
      first_name: firstName,
      last_name: lastName,
      email: newUser.email,
      phone: '+1-800-555-0' + (100 + newEmpId),
      designation: designation || 'Staff Specialist',
      department_id: departmentId ? Number(departmentId) : 1,
      join_date: new Date().toISOString().split('T')[0],
      photo_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
      status: 'Active' as const,
      created_at: now,
      updated_at: now,
    };

    db.employees.push(newEmployee);
    db.recalculateAllGaps();

    // Persist directly into MySQL database
    await queryAsync(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE email=VALUES(email)',
      [newUser.id, newUser.email, newUser.password_hash, newUser.role]
    );

    await queryAsync(
      'INSERT INTO employees (id, user_id, first_name, last_name, email, designation, department_id, join_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email=VALUES(email)',
      [newEmployee.id, newEmployee.user_id, newEmployee.first_name, newEmployee.last_name, newEmployee.email, newEmployee.designation, newEmployee.department_id, newEmployee.join_date, newEmployee.status]
    );

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        employeeId: newEmployee.id,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        employee: newEmployee,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

export const googleLogin = async (req: AuthRequest, res: Response) => {
  try {
    const { email, firstName, lastName, photoUrl, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    
    // First check MySQL database
    let user: any = null;
    let employee: any = null;

    const userRows = await queryAsync('SELECT * FROM users WHERE LOWER(email)=?', [cleanEmail]);
    if (userRows && userRows.length > 0) {
      const uRow = userRows[0];
      user = {
        id: uRow.id,
        email: uRow.email,
        password_hash: uRow.password_hash,
        role: uRow.role,
        created_at: uRow.created_at || new Date().toISOString(),
        updated_at: uRow.updated_at || new Date().toISOString(),
      };
      
      const empRows = await queryAsync('SELECT * FROM employees WHERE user_id=? OR LOWER(email)=?', [user.id, cleanEmail]);
      if (empRows && empRows.length > 0) {
        const eRow = empRows[0];
        employee = {
          id: eRow.id,
          user_id: eRow.user_id,
          first_name: eRow.first_name,
          last_name: eRow.last_name,
          email: eRow.email,
          phone: eRow.phone || '',
          designation: eRow.designation,
          department_id: eRow.department_id,
          join_date: eRow.join_date,
          photo_url: eRow.photo_url || photoUrl || 'https://lh3.googleusercontent.com/a/default-user',
          status: eRow.status,
          created_at: eRow.created_at || new Date().toISOString(),
          updated_at: eRow.updated_at || new Date().toISOString(),
        };
      }
    }

    // Fallback to in-memory db search if not found in MySQL
    if (!user) {
      user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (user) {
        employee = db.employees.find(e => e.user_id === user!.id);
      }
    }

    // If still not found, auto-create user and employee
    if (!user) {
      const now = new Date().toISOString();
      const newUserId = db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
      const defaultRole = cleanEmail.includes('admin') ? 'Admin' : cleanEmail.includes('manager') ? 'Manager' : 'Employee';

      user = {
        id: newUserId,
        email: cleanEmail,
        password_hash: bcrypt.hashSync(`GoogleAuth_${googleId || Date.now()}`, 10),
        role: defaultRole as any,
        created_at: now,
        updated_at: now,
      };

      db.users.push(user);

      const newEmpId = db.employees.length ? Math.max(...db.employees.map(e => e.id)) + 1 : 1;
      employee = {
        id: newEmpId,
        user_id: newUserId,
        first_name: firstName || cleanEmail.split('@')[0],
        last_name: lastName || 'User',
        email: user.email,
        phone: '+1-800-555-0' + (100 + newEmpId),
        designation: defaultRole === 'Admin' ? 'System Administrator' : defaultRole === 'Manager' ? 'Department Manager' : 'Specialist',
        department_id: 1,
        join_date: new Date().toISOString().split('T')[0],
        photo_url: photoUrl || `https://lh3.googleusercontent.com/a/default-user`,
        status: 'Active' as const,
        created_at: now,
        updated_at: now,
      };

      db.employees.push(employee);
      db.recalculateAllGaps();

      // Persist to MySQL
      await queryAsync(
        'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE email=VALUES(email)',
        [user.id, user.email, user.password_hash, user.role]
      );

      await queryAsync(
        'INSERT INTO employees (id, user_id, first_name, last_name, email, designation, department_id, join_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email=VALUES(email)',
        [employee.id, employee.user_id, employee.first_name, employee.last_name, employee.email, employee.designation, employee.department_id, employee.join_date, employee.status]
      );
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: employee ? employee.id : undefined,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: employee || null,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Google login failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  let user = db.users.find(u => u.id === req.user!.id || u.email === req.user!.email);
  if (!user) {
    const rows = await queryAsync('SELECT * FROM users WHERE id=? OR email=?', [req.user.id, req.user.email]);
    if (rows && rows.length > 0) {
      user = {
        id: rows[0].id,
        email: rows[0].email,
        password_hash: rows[0].password_hash,
        role: rows[0].role,
        created_at: rows[0].created_at || new Date().toISOString(),
        updated_at: rows[0].updated_at || new Date().toISOString(),
      };
      if (!db.users.some(u => u.id === user!.id)) {
        db.users.push(user);
      }
    }
  }

  if (!user) {
    user = {
      id: req.user.id,
      email: req.user.email,
      password_hash: '',
      role: req.user.role || 'Employee',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  let employee = db.employees.find(e => e.user_id === user!.id || e.email === user!.email);
  if (!employee) {
    const empRows = await queryAsync('SELECT * FROM employees WHERE user_id=? OR email=?', [user.id, user.email]);
    if (empRows && empRows.length > 0) {
      const row = empRows[0];
      employee = {
        id: row.id,
        user_id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone || '',
        designation: row.designation,
        department_id: row.department_id,
        join_date: row.join_date,
        photo_url: row.photo_url || '',
        status: row.status,
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString(),
      };
      if (!db.employees.some(e => e.id === employee!.id)) {
        db.employees.push(employee);
      }
    }
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      employee: employee || null,
    },
  });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const userId = req.user.id;
    const { firstName, lastName, phone, designation, photoUrl, password } = req.body;

    // Update password if provided
    if (password && password.trim().length > 0) {
      const password_hash = bcrypt.hashSync(password, 10);
      await queryAsync('UPDATE users SET password_hash=? WHERE id=?', [password_hash, userId]);
      const memUser = db.users.find(u => u.id === userId);
      if (memUser) memUser.password_hash = password_hash;
    }

    // Update employee profile
    await queryAsync(
      'UPDATE employees SET first_name=COALESCE(?, first_name), last_name=COALESCE(?, last_name), phone=COALESCE(?, phone), designation=COALESCE(?, designation), photo_url=COALESCE(?, photo_url) WHERE user_id=?',
      [firstName || null, lastName || null, phone || null, designation || null, photoUrl || null, userId]
    );

    const memEmp = db.employees.find(e => e.user_id === userId);
    if (memEmp) {
      if (firstName) memEmp.first_name = firstName;
      if (lastName) memEmp.last_name = lastName;
      if (phone) memEmp.phone = phone;
      if (designation) memEmp.designation = designation;
      if (photoUrl) memEmp.photo_url = photoUrl;
    }

    // Return updated user object
    const user = db.users.find(u => u.id === userId);
    const employee = db.employees.find(e => e.user_id === userId);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user?.id || userId,
        email: user?.email || req.user.email,
        role: user?.role || req.user.role,
        employee: employee || null,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};

