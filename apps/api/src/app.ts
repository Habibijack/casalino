import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { AppEnv } from './types';
import { errorHandler } from './middleware/error-handler';
import { authMiddleware } from './middleware/auth';
import { orgContextMiddleware } from './middleware/org-context';
import { healthRouter } from './routes/health';
import { listingsRouter } from './routes/listings';
import { applicationsRouter } from './routes/applications';
import { viewingsRouter } from './routes/viewings';
import { contractsRouter } from './routes/contracts';
import { membersRouter } from './routes/members';

const app = new Hono<AppEnv>();

// ---------------------
// Global middleware
// ---------------------

app.use('*', logger());

app.use(
  '*',
  cors({
    origin: ['http://localhost:3737', 'https://app.casalino.ch'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  }),
);

// ---------------------
// Error handler
// ---------------------

app.onError(errorHandler);

// ---------------------
// Public routes
// ---------------------

app.route('/api/v1', healthRouter);

// ---------------------
// Protected routes
// ---------------------

const protectedApi = new Hono<AppEnv>();

protectedApi.use('*', authMiddleware);
protectedApi.use('*', orgContextMiddleware);

protectedApi.route('/listings', listingsRouter);
protectedApi.route('/applications', applicationsRouter);
protectedApi.route('/viewings', viewingsRouter);
protectedApi.route('/contracts', contractsRouter);
protectedApi.route('/members', membersRouter);

app.route('/api/v1', protectedApi);

export { app };
