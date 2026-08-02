import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', getLeaderboard);

export default router;
