import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { AppEnv } from './types';
import { errorHandler } from './middleware/error-handler';
import { rateLimiter } from './middleware/rate-limit';
import { authMiddleware } from './middleware/auth';
import { orgContextMiddleware } from './middleware/org-context';
import { healthRouter } from './routes/health';
import { listingsRouter, publicListingsRouter } from './routes/listings';
import { applicationsRouter, publicApplicationsRouter } from './routes/applications';
import { viewingsRouter } from './routes/viewings';
import { contractsRouter, publicContractsRouter } from './routes/contracts';
import { publicViewingsRouter } from './routes/public-viewings';
import { membersRouter } from './routes/members';
import { dashboardRouter } from './routes/dashboard';
import { portalsRouter } from './routes/portals';
import { billingRouter, stripeWebhookRouter } from './routes/billing';
import { insightsRouter } from './routes/insights';
import { documentsRouter } from './routes/documents';
import { onboardingRouter } from './routes/onboarding';

const app = new Hono<AppEnv>();

// ---------------------
// Global middleware
// ---------------------

app.use('*', logger());
app.use('*', rateLimiter({ max: 100, windowSec: 60 }));

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
app.route('/api/v1/public/applications', publicApplicationsRouter);
app.route('/api/v1/public/listings', publicListingsRouter);
app.route('/api/v1/public/contracts', publicContractsRouter);
app.route('/api/v1/public/viewings', publicViewingsRouter);
app.route('/api/v1/webhooks/stripe', stripeWebhookRouter);

// ---------------------
// Auth-only routes (no org required)
// ---------------------

const authOnlyApi = new Hono<AppEnv>();
authOnlyApi.use('*', authMiddleware);
authOnlyApi.route('/onboarding', onboardingRouter);

app.route('/api/v1', authOnlyApi);

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
protectedApi.route('/dashboard', dashboardRouter);
protectedApi.route('/portals', portalsRouter);
protectedApi.route('/billing', billingRouter);
protectedApi.route('/insights', insightsRouter);
protectedApi.route('/documents', documentsRouter);

app.route('/api/v1', protectedApi);

export { app };
