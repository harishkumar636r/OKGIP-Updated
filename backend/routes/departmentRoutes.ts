import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authorizeRoles(['Admin']), createDepartment);
router.put('/:id', authorizeRoles(['Admin', 'Manager']), updateDepartment);
router.delete('/:id', authorizeRoles(['Admin']), deleteDepartment);

export default router;
