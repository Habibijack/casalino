import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

export const scoringQueue = new Queue('scoring', { connection });

export const emailQueue = new Queue('email', { connection });

export const creditCheckQueue = new Queue('credit-check', { connection });

export const reminderQueue = new Queue('reminder', { connection });

export const referenceQueue = new Queue('reference', { connection });
