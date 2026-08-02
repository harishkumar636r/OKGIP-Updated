import { Router } from 'express';
import {
  getTrainings,
  createTraining,
  getAssignments,
  assignTraining,
  updateAssignmentProgress,
} from '../controllers/trainingController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getTrainings);
router.post('/', authorizeRoles(['Admin', 'Manager']), createTraining);
router.get('/assignments', getAssignments);
router.post('/assign', authorizeRoles(['Admin', 'Manager']), assignTraining);
router.put('/assignments/:id/progress', updateAssignmentProgress);

export default router;
