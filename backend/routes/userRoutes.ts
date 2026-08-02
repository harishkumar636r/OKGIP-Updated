import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles(['Admin']));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
