import { Request, Response } from 'express';
import { db } from '../config/db';

export const getBadges = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.query;
    let list = db.badges;
    if (employeeId) {
      list = list.filter((b) => b.employee_id === Number(employeeId));
    }
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const awardBadge = async (req: Request, res: Response) => {
  try {
    const { employeeId, badgeType, description, icon } = req.body;
    const newBadge = {
      id: db.badges.length + 1,
      employee_id: Number(employeeId),
      badge_type: badgeType,
      description: description || `Awarded ${badgeType} badge`,
      icon: icon || 'Award',
      awarded_at: new Date().toISOString().split('T')[0],
    };

    db.badges.push(newBadge);

    // Notify employee
    const emp = db.employees.find((e) => e.id === Number(employeeId));
    if (emp) {
      db.notifications.push({
        id: db.notifications.length + 1,
        user_id: emp.user_id,
        title: 'New Badge Earned! 🏆',
        message: `Congratulations! You have been awarded the '${badgeType}' badge.`,
        type: 'Skill Verified',
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    res.json({ success: true, data: newBadge, message: 'Badge awarded successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
