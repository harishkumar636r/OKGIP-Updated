import { Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Admin gets all notifications or system notifications; employees get their user_id notifications
  let list = db.notifications;
  if (req.user.role !== 'Admin') {
    list = list.filter(n => n.user_id === req.user!.id);
  }

  list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = list.filter(n => !n.is_read).length;

  return res.json({
    success: true,
    unread_count: unreadCount,
    data: list,
  });
};

export const markAsRead = (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (id === 'all') {
    if (req.user) {
      db.notifications.forEach(n => {
        if (req.user!.role === 'Admin' || n.user_id === req.user!.id) {
          n.is_read = true;
        }
      });
    }
    return res.json({ success: true, message: 'All notifications marked as read' });
  }

  const notif = db.notifications.find(n => n.id === Number(id));
  if (!notif) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  notif.is_read = true;
  return res.json({ success: true, message: 'Notification marked as read' });
};
