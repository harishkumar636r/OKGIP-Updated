import { Router } from 'express';
import { getBadges, awardBadge } from '../controllers/badgeController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', getBadges);
router.post('/award', authorizeRoles(['Admin', 'Manager']), awardBadge);

export default router;
