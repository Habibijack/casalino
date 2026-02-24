import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../types';
import { logger } from '../lib/logger';

/**
 * Structured request/response logger.
 * Logs method, path, status, and duration.
 * No body logging (PII risk).
 */
export const requestLogger: MiddlewareHandler<AppEnv> = async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  // Skip health check noise
  if (path === '/api/v1/health') return;

  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

  logger[level]('request', {
    method,
    path,
    status,
    durationMs: duration,
    orgId: c.get('orgId') ?? undefined,
    userId: c.get('userId') ?? undefined,
  });
};
