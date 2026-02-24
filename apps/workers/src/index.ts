import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { Worker, type Job } from 'bullmq';
import { connection } from './lib/redis';
import { processScoringJob } from './processors/scoring.processor';
import { processEmailJob } from './processors/email.processor';
import { processCreditCheckJob } from './processors/credit-check.processor';
import { processReminderJob } from './processors/reminder.processor';

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
  processEmailJob,
  { connection },
);

emailWorker.on('completed', logCompleted('email'));
emailWorker.on('failed', logFailed('email'));

// ---------------------------------------------------------------------------
// Scoring worker
// ---------------------------------------------------------------------------
const scoringWorker = new Worker(
  'scoring',
  processScoringJob,
  { connection },
);

scoringWorker.on('completed', logCompleted('scoring'));
scoringWorker.on('failed', logFailed('scoring'));

// ---------------------------------------------------------------------------
// Credit check worker
// ---------------------------------------------------------------------------
const creditWorker = new Worker(
  'credit-check',
  processCreditCheckJob,
  { connection },
);

creditWorker.on('completed', logCompleted('credit-check'));
creditWorker.on('failed', logFailed('credit-check'));

// ---------------------------------------------------------------------------
// Reminder worker
// ---------------------------------------------------------------------------
const reminderWorker = new Worker(
  'reminder',
  processReminderJob,
  { connection },
);

reminderWorker.on('completed', logCompleted('reminder'));
reminderWorker.on('failed', logFailed('reminder'));

console.log('Workers registered: email, scoring, credit-check, reminder');
