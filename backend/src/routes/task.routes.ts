import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createTaskSchema, updateTaskSchema, taskFiltersSchema } from '../validators/task.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createTaskSchema), TaskController.createTask);
router.get('/', validate(taskFiltersSchema, 'query'), TaskController.getTasks);
router.get('/:id', TaskController.getTaskById);
router.patch('/:id', validate(updateTaskSchema), TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);
router.post('/:id/toggle', TaskController.toggleTaskStatus);

export default router;
