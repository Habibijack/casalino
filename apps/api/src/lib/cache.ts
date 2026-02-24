import IORedis from 'ioredis';
import { logger } from './logger';

/**
 * Redis cache with in-memory fallback.
 * TTL-based, org-scoped keys for multi-tenant safety.
 */

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
interface MemCacheEntry {
  value: string;
  expiresAt: number;
}

const memCache = new Map<string, MemCacheEntry>();

// Cleanup stale entries every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memCache) {
    if (entry.expiresAt <= now) {
      memCache.delete(key);
    }
  }
}, 2 * 60 * 1000).unref();

// ---------------------
// Public API
// ---------------------

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();

  if (redis) {
    try {
      const raw = await redis.get(key);
      if (raw) return JSON.parse(raw) as T;
      return null;
    } catch {
      // fallback
    }
  }

  const entry = memCache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return JSON.parse(entry.value) as T;
  }

  memCache.delete(key);
  return null;
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSec: number,
): Promise<void> {
  const raw = JSON.stringify(value);
  const redis = getRedis();

  if (redis) {
    try {
      await redis.setex(key, ttlSec, raw);
      return;
    } catch {
      // fallback
    }
  }

  memCache.set(key, {
    value: raw,
    expiresAt: Date.now() + ttlSec * 1000,
  });
}

export async function cacheInvalidate(pattern: string): Promise<void> {
  const redis = getRedis();

  if (redis) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return;
    } catch {
      // fallback
    }
  }

  // In-memory: match by prefix (strip trailing *)
  const prefix = pattern.replace(/\*$/, '');
  for (const key of memCache.keys()) {
    if (key.startsWith(prefix)) {
      memCache.delete(key);
    }
  }
}

/**
 * Build an org-scoped cache key.
 * Example: cache:org:abc123:dashboard:stats
 */
export function orgCacheKey(
  orgId: string,
  ...segments: string[]
): string {
  return `cache:org:${orgId}:${segments.join(':')}`;
}

/**
 * Cache-aside helper: get from cache or compute and store.
 */
export async function cacheOrCompute<T>(
  key: string,
  ttlSec: number,
  compute: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    logger.debug('cache_hit', { key });
    return cached;
  }

  logger.debug('cache_miss', { key });
  const value = await compute();
  await cacheSet(key, value, ttlSec);
  return value;
}
