import { Router } from 'express';
import { getEmployeeReport, getGapReport, getTrainingReport } from '../controllers/reportController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles(['Admin', 'Manager']));

router.get('/employees', getEmployeeReport);
router.get('/gaps', getGapReport);
router.get('/trainings', getTrainingReport);

export default router;
