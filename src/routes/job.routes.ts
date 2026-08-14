import { Router } from 'express';
import { JobController } from '../controllers/job.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);
router.get('/:id', JobController.getJobStatus);

export default router;
