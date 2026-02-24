import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../types';
import IORedis from 'ioredis';

/**
 * Redis-backed sliding window rate limiter.
 * Falls back to in-memory if Redis is unavailable.
 */

interface RateLimitOptions {
  /** Max requests per window. Default: 100 */
  max?: number;
  /** Window duration in seconds. Default: 60 */
  windowSec?: number;
  /** Key prefix for Redis. Default: 'rl' */
  prefix?: string;
}

// Shared Redis connection (lazy)
let _redis: IORedis | null = null;
let _redisFailed = false;

function getRedis(): IORedis | null {
  if (_redisFailed) return null;
  if (_redis) return _redis;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  try {
    _redis = new IORedis(redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      connectTimeout: 2000,
    });

    _redis.on('error', () => {
      _redisFailed = true;
      _redis = null;
    });

    return _redis;
  } catch {
    _redisFailed = true;
    return null;
  }
}

// In-memory fallback
interface MemEntry {
  count: number;
  resetAt: number;
}

const memStore = new Map<string, MemEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memStore) {
    if (entry.resetAt <= now) {
      memStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export function rateLimiter(
  options: RateLimitOptions = {},
): MiddlewareHandler<AppEnv> {
  const max = options.max ?? 100;
  const windowSec = options.windowSec ?? 60;
  const prefix = options.prefix ?? 'rl';

  return async (c, next) => {
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
      c.req.header('x-real-ip') ??
      'unknown';

    const key = `${prefix}:${ip}`;
    const redis = getRedis();

    let count: number;
    let remaining: number;

    if (redis) {
      try {
        // Redis sliding window: INCR + EXPIRE
        count = await redis.incr(key);
        if (count === 1) {
          await redis.expire(key, windowSec);
        }
        remaining = Math.max(0, max - count);
      } catch {
        // Fallback to memory on Redis error
        const result = memCheck(key, max, windowSec);
        count = result.count;
        remaining = result.remaining;
      }
    } else {
      const result = memCheck(key, max, windowSec);
      count = result.count;
      remaining = result.remaining;
    }

    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(remaining));

    if (count > max) {
      c.header('Retry-After', String(windowSec));
      return c.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message:
              'Zu viele Anfragen. Bitte versuchen Sie es spaeter erneut.',
          },
        },
        429,
      );
    }

    await next();
  };
}

function memCheck(
  key: string,
  max: number,
  windowSec: number,
): { count: number; remaining: number } {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const existing = memStore.get(key);

  if (!existing || existing.resetAt <= now) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { count: 1, remaining: max - 1 };
  }

  existing.count += 1;
  return {
    count: existing.count,
    remaining: Math.max(0, max - existing.count),
  };
}

// Pre-configured rate limiters for different tiers
export const publicRateLimiter = rateLimiter({
  max: 20,
  windowSec: 60,
  prefix: 'rl:pub',
});

export const aiRateLimiter = rateLimiter({
  max: 30,
  windowSec: 60,
  prefix: 'rl:ai',
});

export const webhookRateLimiter = rateLimiter({
  max: 500,
  windowSec: 60,
  prefix: 'rl:wh',
});
