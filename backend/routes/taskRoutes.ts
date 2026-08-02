import { Router } from 'express';
import { getTasks, createTask, updateTask } from '../controllers/taskController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', getTasks);
router.post('/', authorizeRoles(['Admin', 'Manager']), createTask);
router.put('/:id', updateTask);

export default router;
