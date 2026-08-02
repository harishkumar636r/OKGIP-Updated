import { Request, Response } from 'express';
import { db } from '../config/db';

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let list = db.leaveRequests;

    if (user?.role === 'Employee') {
      const emp = db.employees.find((e) => e.user_id === user.id);
      if (emp) {
        list = list.filter((l) => l.employee_id === emp.id);
      }
    } else if (user?.role === 'Manager') {
      const mgrEmp = db.employees.find((e) => e.user_id === user.id);
      if (mgrEmp?.department_id) {
        const deptEmps = db.employees.filter((e) => e.department_id === mgrEmp.department_id).map((e) => e.id);
        list = list.filter((l) => deptEmps.includes(l.employee_id));
      }
    }

    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyLeave = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { leaveType, startDate, endDate, reason } = req.body;

    const emp = db.employees.find((e) => e.user_id === user.id);
    if (!emp) {
      return res.status(400).json({ success: false, message: 'Employee profile required to apply for leave' });
    }

    const dept = db.departments.find((d) => d.id === emp.department_id);

    const newLeave = {
      id: db.leaveRequests.length + 1,
      employee_id: emp.id,
      employee_name: `${emp.first_name} ${emp.last_name}`,
      department_name: dept?.name || 'General',
      leave_type: leaveType || 'Annual',
      start_date: startDate,
      end_date: endDate,
      reason: reason || 'Not specified',
      status: 'Pending' as const,
      created_at: new Date().toISOString(),
    };

    db.leaveRequests.push(newLeave);

    // Notify Department Manager / Admin
    const mgrs = db.users.filter((u) => u.role === 'Manager' || u.role === 'Admin');
    mgrs.forEach((m) => {
      db.notifications.push({
        id: db.notifications.length + 1,
        user_id: m.id,
        title: 'New Leave Request Submitted',
        message: `${newLeave.employee_name} requested ${leaveType} leave from ${startDate} to ${endDate}.`,
        type: 'System',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    });

    res.json({ success: true, data: newLeave, message: 'Leave request submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeaveStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Approved or Rejected
    const user = (req as any).user;

    const leave = db.leaveRequests.find((l) => l.id === Number(id));
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    const approverEmp = db.employees.find((e) => e.user_id === user?.id);
    leave.approved_by = approverEmp ? `${approverEmp.first_name} ${approverEmp.last_name}` : user?.email;

    // Update employee status if approved
    const emp = db.employees.find((e) => e.id === leave.employee_id);
    if (emp && status === 'Approved') {
      emp.status = 'On Leave';
    }

    // Notify employee
    if (emp) {
      db.notifications.push({
        id: db.notifications.length + 1,
        user_id: emp.user_id,
        title: `Leave Request ${status}`,
        message: `Your ${leave.leave_type} leave request from ${leave.start_date} to ${leave.end_date} was ${status}.`,
        type: 'Leave Approved',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    res.json({ success: true, data: leave, message: `Leave status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
