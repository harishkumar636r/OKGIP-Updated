import { Router } from 'express';
import { getLearningPath, getMyLearningPath } from '../controllers/learningPathController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/me', getMyLearningPath);
router.get('/:employeeId', getLearningPath);

export default router;
