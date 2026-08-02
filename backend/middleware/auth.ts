import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'okgip_secret_key_college_project_2026';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'Admin' | 'Manager' | 'Employee';
    employeeId?: number;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function authorizeRoles(roles: Array<'Admin' | 'Manager' | 'Employee'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of these roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
}
