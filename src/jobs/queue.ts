import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env.js';

export const redisConnection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

export const EMAIL_QUEUE_NAME = 'email-notifications';

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000, // 1s -> 2s -> 4s
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: false, // Keep in queue for DLQ / failed state inspection
  },
});

export interface TaskAssignmentEmailPayload {
  taskId: string;
  taskTitle: string;
  assigneeUserId: string;
  assigneeEmail: string;
  assigneeName: string;
  assignerUserId: string;
  orgId: string;
}

export const enqueueTaskAssignmentEmail = async (payload: TaskAssignmentEmailPayload) => {
  // Deduplication key window (5 seconds)
  const jobId = `assignment:${payload.taskId}:${payload.assigneeUserId}:${Math.floor(Date.now() / 5000)}`;

  return emailQueue.add('send-task-assignment-email', payload, {
    jobId,
  });
};
