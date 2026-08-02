import { Router } from 'express';
import { getKnowledgeGaps, getGapAnalytics, resolveGap } from '../controllers/gapController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getKnowledgeGaps);
router.get('/analytics', getGapAnalytics);
router.put('/:id/resolve', authorizeRoles(['Admin', 'Manager']), resolveGap);

export default router;
