import { Request, Response, NextFunction } from 'express';
import { emailQueue } from '../jobs/queue.js';
import { NotFoundError } from '../utils/errors.js';

export class JobController {
  static async getJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jobId = req.params.id;
      const job = await emailQueue.getJob(jobId);

      if (!job) {
        throw new NotFoundError('Job not found', 'JOB_NOT_FOUND');
      }

      const state = await job.getState();

      let mappedStatus: 'pending' | 'active' | 'completed' | 'failed' = 'pending';
      if (state === 'active') mappedStatus = 'active';
      else if (state === 'completed') mappedStatus = 'completed';
      else if (state === 'failed') mappedStatus = 'failed';
      else if (state === 'waiting' || state === 'delayed') mappedStatus = 'pending';

      res.status(200).json({
        id: job.id,
        name: job.name,
        status: mappedStatus,
        rawState: state,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason || null,
        data: job.data,
        timestamp: job.timestamp,
      });
    } catch (error) {
      next(error);
    }
  }
}
