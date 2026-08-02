import { Router } from 'express';
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  assignEmployeeSkill,
} from '../controllers/skillController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getSkills);
router.post('/', authorizeRoles(['Admin', 'Manager']), createSkill);
router.put('/:id', authorizeRoles(['Admin', 'Manager']), updateSkill);
router.delete('/:id', authorizeRoles(['Admin']), deleteSkill);
router.post('/assess', authorizeRoles(['Admin', 'Manager']), assignEmployeeSkill);

export default router;
