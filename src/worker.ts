import { Worker, Job } from 'bullmq';
import { EMAIL_QUEUE_NAME, redisConnection, TaskAssignmentEmailPayload } from './jobs/queue.js';

console.log('⚡ Starting TaskFlow BullMQ Email Worker Process...');

const worker = new Worker<TaskAssignmentEmailPayload>(
  EMAIL_QUEUE_NAME,
  async (job: Job<TaskAssignmentEmailPayload>) => {
    console.log(`[Worker] Processing Job ID: ${job.id} | Name: ${job.name}`);
    console.log(`[Worker] Attempt ${job.attemptsMade + 1} of ${job.opts.attempts}`);

    const { taskId, taskTitle, assigneeEmail, assigneeName } = job.data;

    // Simulate mock email dispatch delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(
      `📧 [MOCK EMAIL SENT] To: ${assigneeName} <${assigneeEmail}> | Task: "${taskTitle}" (ID: ${taskId})`
    );

    return {
      sent: true,
      timestamp: new Date().toISOString(),
      recipient: assigneeEmail,
    };
  },
  {
    connection: redisConnection,
    concurrency: 5,
    limiter: {
      max: 50,
      duration: 60000, // Global rate limit: 50 emails per minute
    },
  }
);

worker.on('completed', (job: Job) => {
  console.log(`✅ [Worker] Job ${job.id} completed successfully.`);
});

worker.on('failed', (job: Job | undefined, err: Error) => {
  if (job) {
    console.error(
      `❌ [Worker] Job ${job.id} failed (Attempt ${job.attemptsMade}/${job.opts.attempts}): ${err.message}`
    );
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      console.error(
        `🚨 [DEAD-LETTER QUEUE] Job ${job.id} exceeded max retries. Moved to Dead-Letter state.`
      );
    }
  } else {
    console.error(`❌ [Worker] Queue job error:`, err);
  }
});
