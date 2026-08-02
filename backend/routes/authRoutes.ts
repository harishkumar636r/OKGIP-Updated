import { Router } from 'express';
import { login, register, googleLogin, getMe, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/google', googleLogin);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);

export default router;

