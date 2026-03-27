import express from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/userController.ts';
import { authenticate, authorize } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authenticate, authorize(['Admin']), getUsers);
router.put('/:id', authenticate, authorize(['Admin']), updateUser);
router.delete('/:id', authenticate, authorize(['Admin']), deleteUser);

export default router;
