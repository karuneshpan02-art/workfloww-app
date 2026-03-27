import express from 'express';
import { createTask, getTasks, updateTaskStatus, deleteTask, getEmployees } from '../controllers/taskController.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import { upload } from '../middleware/upload.ts';

const router = express.Router();

router.post('/', authenticate, authorize(['Admin']), upload.single('file'), createTask);
router.get('/', authenticate, getTasks);
router.put('/:id', authenticate, upload.single('file'), updateTaskStatus);
router.delete('/:id', authenticate, authorize(['Admin']), deleteTask);
router.get('/employees', authenticate, authorize(['Admin']), getEmployees);

export default router;
