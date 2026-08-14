import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  getTasksQuerySchema,
  assignTaskUserSchema,
  bulkUpdateTaskStatusSchema,
} from '../validators/task.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createTaskSchema), TaskController.create);
router.get('/', validate(getTasksQuerySchema), TaskController.list);
router.patch('/bulk-status', validate(bulkUpdateTaskStatusSchema), TaskController.bulkUpdateStatus);

router.get('/:id', TaskController.getById);
router.put('/:id', validate(updateTaskSchema), TaskController.update);
router.delete('/:id', TaskController.delete);

router.post('/:id/assign', validate(assignTaskUserSchema), TaskController.assignUser);
router.delete('/:id/assign/:userId', TaskController.unassignUser);

export default router;
