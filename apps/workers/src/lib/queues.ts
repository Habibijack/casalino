import { Queue } from 'bullmq';
import { connection } from './redis';

export const emailQueue = new Queue('email', { connection });

export const scoringQueue = new Queue('scoring', { connection });

export const creditCheckQueue = new Queue('credit-check', { connection });
