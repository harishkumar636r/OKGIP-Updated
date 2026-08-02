import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorizeRoles(['Admin', 'Manager']), createEmployee);
router.put('/:id', authorizeRoles(['Admin', 'Manager']), updateEmployee);
router.delete('/:id', authorizeRoles(['Admin']), deleteEmployee);

export default router;
