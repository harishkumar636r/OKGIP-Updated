import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', authorizeRoles(['Admin']), getAuditLogs);

export default router;
