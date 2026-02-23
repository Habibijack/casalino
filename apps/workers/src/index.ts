import { Worker, type Job } from 'bullmq';
import { connection } from './lib/redis';

function logCompleted(queueName: string) {
  return (job: Job | undefined) => {
    if (job) {
      console.log(`[${queueName}] Job ${job.id} completed`);
    }
  };
}

function logFailed(queueName: string) {
  return (job: Job | undefined, err: Error) => {
    console.error(`[${queueName}] Job ${job?.id ?? 'unknown'} failed:`, err.message);
  };
}

console.log('Casalino Workers starting...');

// ---------------------------------------------------------------------------
// Email notification worker
// ---------------------------------------------------------------------------
const emailWorker = new Worker(
  'email',
  async (job: Job) => {
    console.log(`Processing email job: ${job.name}`, job.data);
    // Implementation in Phase 2
  },
  { connection },
);

emailWorker.on('completed', logCompleted('email'));
emailWorker.on('failed', logFailed('email'));

// ---------------------------------------------------------------------------
// Scoring worker
// ---------------------------------------------------------------------------
const scoringWorker = new Worker(
  'scoring',
  async (job: Job) => {
    console.log(`Processing scoring job: ${job.name}`, job.data);
    // Implementation in Phase 2
  },
  { connection },
);

scoringWorker.on('completed', logCompleted('scoring'));
scoringWorker.on('failed', logFailed('scoring'));

// ---------------------------------------------------------------------------
// Credit check worker
// ---------------------------------------------------------------------------
const creditWorker = new Worker(
  'credit-check',
  async (job: Job) => {
    console.log(`Processing credit check job: ${job.name}`, job.data);
    // Implementation in Phase 2
  },
  { connection },
);

creditWorker.on('completed', logCompleted('credit-check'));
creditWorker.on('failed', logFailed('credit-check'));

console.log('Workers registered: email, scoring, credit-check');
