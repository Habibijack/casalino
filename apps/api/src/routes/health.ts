import { Hono } from 'hono';
import { sql } from 'drizzle-orm';
import { getDb } from '../lib/db';
import IORedis from 'ioredis';

interface ServiceCheck {
  status: 'ok' | 'degraded' | 'down';
  latencyMs?: number;
}

export const healthRouter = new Hono()
  .get('/health', async (c) => {
    const checks: Record<string, ServiceCheck> = {};

    // Database check
    const dbStart = Date.now();
    try {
      const db = getDb();
      await db.execute(sql`SELECT 1`);
      checks['database'] = { status: 'ok', latencyMs: Date.now() - dbStart };
    } catch {
      checks['database'] = { status: 'down', latencyMs: Date.now() - dbStart };
    }

    // Redis check
    const redisStart = Date.now();
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        const redis = new IORedis(redisUrl, {
          connectTimeout: 2000,
          maxRetriesPerRequest: 1,
          lazyConnect: true,
        });
        await redis.ping();
        checks['redis'] = { status: 'ok', latencyMs: Date.now() - redisStart };
        await redis.quit();
      } catch {
        checks['redis'] = { status: 'down', latencyMs: Date.now() - redisStart };
      }
    } else {
      checks['redis'] = { status: 'degraded' };
    }

    // External services (not checked live — just report configured)
    checks['stripe'] = { status: process.env.STRIPE_SECRET_KEY ? 'ok' : 'degraded' };
    checks['ai'] = { status: process.env.ANTHROPIC_API_KEY ? 'ok' : 'degraded' };
    checks['email'] = { status: process.env.RESEND_API_KEY ? 'ok' : 'degraded' };

    // Overall status
    const dbDown = checks['database']?.status === 'down';
    const redisDown = checks['redis']?.status === 'down';
    const hasDegraded = Object.values(checks).some((ch) => ch.status === 'degraded');

    let overallStatus: 'ok' | 'degraded' | 'down' = 'ok';
    if (dbDown) {
      overallStatus = 'down';
    } else if (redisDown || hasDegraded) {
      overallStatus = 'degraded';
    }

    const statusCode = overallStatus === 'down' ? 503 : 200;

    return c.json(
      {
        status: overallStatus,
        checks,
        version: process.env.APP_VERSION ?? '0.1.0',
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  });
