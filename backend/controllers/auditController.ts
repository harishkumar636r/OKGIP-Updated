import { Request, Response } from 'express';
import { db } from '../config/db';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }

    const logs = [...db.auditLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
