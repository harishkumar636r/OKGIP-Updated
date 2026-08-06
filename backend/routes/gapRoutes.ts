import { Router } from 'express';
import { getKnowledgeGaps, getGapAnalytics, getGapHeatmap, resolveGap } from '../controllers/gapController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getKnowledgeGaps);
router.get('/analytics', getGapAnalytics);
router.get('/heatmap', getGapHeatmap);
router.put('/:id/resolve', authorizeRoles(['Admin', 'Manager']), resolveGap);

export default router;
