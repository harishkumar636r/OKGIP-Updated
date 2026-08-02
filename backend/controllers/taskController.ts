import { Request, Response } from 'express';
import { db } from '../config/db';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let list = db.tasks;

    if (user?.role === 'Employee') {
      const emp = db.employees.find((e) => e.user_id === user.id);
      if (emp) {
        list = list.filter((t) => t.employee_id === emp.id);
      }
    } else if (user?.role === 'Manager') {
      const mgrEmp = db.employees.find((e) => e.user_id === user.id);
      if (mgrEmp?.department_id) {
        const deptEmps = db.employees.filter((e) => e.department_id === mgrEmp.department_id).map((e) => e.id);
        list = list.filter((t) => deptEmps.includes(t.employee_id) || t.assigned_by === mgrEmp.id);
      }
    }

    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { title, description, employeeId, dueDate, priority } = req.body;

    const assignerEmp = db.employees.find((e) => e.user_id === user?.id);
    const targetEmp = db.employees.find((e) => e.id === Number(employeeId));

    if (!targetEmp) {
      return res.status(400).json({ success: false, message: 'Assigned employee not found' });
    }

    const newTask = {
      id: db.tasks.length + 1,
      title,
      description: description || '',
      assigned_by: assignerEmp ? assignerEmp.id : user?.id,
      assigned_by_name: assignerEmp ? `${assignerEmp.first_name} ${assignerEmp.last_name}` : 'Management',
      employee_id: targetEmp.id,
      employee_name: `${targetEmp.first_name} ${targetEmp.last_name}`,
      due_date: dueDate,
      priority: priority || 'Medium',
      status: 'Pending' as const,
      progress_percentage: 0,
      created_at: new Date().toISOString(),
    };

    db.tasks.push(newTask);

    // Notify employee
    db.notifications.push({
      id: db.notifications.length + 1,
      user_id: targetEmp.user_id,
      title: 'New Task Assigned 📌',
      message: `You were assigned task '${title}' due on ${dueDate}.`,
      type: 'Task Assigned',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    res.json({ success: true, data: newTask, message: 'Task assigned successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, progressPercentage } = req.body;

    const task = db.tasks.find((t) => t.id === Number(id));
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (progressPercentage !== undefined) {
      task.progress_percentage = Number(progressPercentage);
      if (task.progress_percentage >= 100) {
        task.status = 'Completed';
      } else if (task.progress_percentage > 0) {
        task.status = 'In Progress';
      }
    }

    if (status) {
      task.status = status;
      if (status === 'Completed') task.progress_percentage = 100;
    }

    res.json({ success: true, data: task, message: 'Task updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
