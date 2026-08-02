import { Router } from 'express';
import { getLeaveRequests, applyLeave, updateLeaveStatus } from '../controllers/leaveController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', getLeaveRequests);
router.post('/', applyLeave);
router.put('/:id/status', authorizeRoles(['Admin', 'Manager']), updateLeaveStatus);

export default router;
