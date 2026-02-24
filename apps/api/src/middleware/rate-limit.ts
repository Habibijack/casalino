import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../types';

/**
 * Simple in-memory rate limiter.
 * Production: replace with Redis-backed sliding window.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Max requests per window. Default: 100 */
  max?: number;
  /** Window duration in seconds. Default: 60 */
  windowSec?: number;
}

export function rateLimiter(
  options: RateLimitOptions = {},
): MiddlewareHandler<AppEnv> {
  const max = options.max ?? 100;
  const windowMs = (options.windowSec ?? 60) * 1000;
  const store = new Map<string, RateLimitEntry>();

  // Cleanup stale entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return async (c, next) => {
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
      c.req.header('x-real-ip') ??
      'unknown';

    const now = Date.now();
    const existing = store.get(ip);

    if (!existing || existing.resetAt <= now) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      c.header('X-RateLimit-Limit', String(max));
      c.header('X-RateLimit-Remaining', String(max - 1));
      await next();
      return;
    }

    existing.count += 1;

    if (existing.count > max) {
      const retryAfter = Math.ceil(
        (existing.resetAt - now) / 1000,
      );
      c.header('Retry-After', String(retryAfter));
      c.header('X-RateLimit-Limit', String(max));
      c.header('X-RateLimit-Remaining', '0');
      return c.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Zu viele Anfragen. Bitte versuchen Sie es spaeter erneut.',
          },
        },
        429,
      );
    }

    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(max - existing.count));
    await next();
  };
}
