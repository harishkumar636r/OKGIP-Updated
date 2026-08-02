import { Router } from 'express';
import { getMessages, sendMessage, markMessageRead } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', getMessages);
router.post('/', sendMessage);
router.put('/:id/read', markMessageRead);

export default router;
