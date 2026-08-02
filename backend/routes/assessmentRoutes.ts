import { Router } from 'express';
import { getAssessments, getAssessmentById, submitAssessment } from '../controllers/assessmentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', getAssessments);
router.get('/:id', getAssessmentById);
router.post('/:id/submit', submitAssessment);

export default router;
