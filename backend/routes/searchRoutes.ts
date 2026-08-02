import { Router } from 'express';
import { globalSearch } from '../controllers/searchController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', globalSearch);

export default router;
