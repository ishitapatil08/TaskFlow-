import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createProjectSchema, updateProjectSchema, getProjectSchema } from '../validators/project.validator.js';
import { TaskController } from '../controllers/task.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createProjectSchema), ProjectController.create);
router.get('/', ProjectController.list);
router.get('/:id', validate(getProjectSchema), ProjectController.getById);
router.put('/:id', validate(updateProjectSchema), ProjectController.update);
router.delete('/:id', requireRole(['org_admin']), validate(getProjectSchema), ProjectController.delete);

// Dashboard route for project
router.get('/:id/dashboard', validate(getProjectSchema), TaskController.getProjectDashboard);

export default router;
