import { Router } from 'express';
import { db } from '../config/db';

const router = Router();

// No authenticateToken here on purpose — the Register page calls this
// before the user has an account/token yet. Only exposes id/name/code,
// nothing sensitive (no head_employee_id, no gap counts, etc — see
// getDepartments in departmentController.ts for the full authenticated
// version used everywhere else in the app).
router.get('/departments', (req, res) => {
  const depts = db.departments.map(d => ({ id: d.id, name: d.name, code: d.code }));
  res.json({ success: true, data: depts });
});

export default router;
