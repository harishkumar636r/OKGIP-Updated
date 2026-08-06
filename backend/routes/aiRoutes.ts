import { Router } from 'express';
import { getAiRecommendations, getPersonalizedRecommendation, getPredictiveAnalysis, handleAiChat } from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/recommendations', getAiRecommendations);
router.get('/recommendations/:employeeId', getPersonalizedRecommendation);
router.get('/predictions', getPredictiveAnalysis);
router.post('/chat', handleAiChat);

export default router;
