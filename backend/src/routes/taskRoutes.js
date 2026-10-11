import { Router } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { validateTaskId } from '../middleware/validateId.js';
import { validateTaskInput } from '../middleware/validateTaskInput.js';

const router = Router();

// Protect ALL task routes using JWT authentication middleware (Practical 7)
router.use(authenticate);

router.get('/', getAllTasks);
router.get('/:id', validateTaskId, getTaskById);
router.post('/', validateTaskInput, createTask);
router.put('/:id', validateTaskId, validateTaskInput, updateTask);
router.delete('/:id', validateTaskId, deleteTask);

export default router;
