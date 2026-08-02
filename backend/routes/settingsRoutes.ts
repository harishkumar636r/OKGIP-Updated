import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles(['Admin']));

router.get('/', getSettings);
router.put('/', updateSettings);

export default router;
