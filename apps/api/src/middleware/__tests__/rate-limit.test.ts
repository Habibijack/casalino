import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { rateLimiter } from '../rate-limit';
import type { AppEnv } from '../../types';

function createTestApp(max: number, windowSec: number): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use('*', rateLimiter({ max, windowSec }));
  app.get('/test', (c) => c.json({ ok: true }));
  return app;
}

describe('rateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('allows requests within the limit', async () => {
    const app = createTestApp(3, 60);

    const res = await app.request('/test', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('3');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('2');
  });

  it('returns 429 when limit is exceeded', async () => {
    const app = createTestApp(2, 60);
    const headers = { 'x-forwarded-for': '1.2.3.4' };

    // First two requests succeed
    await app.request('/test', { headers });
    await app.request('/test', { headers });

    // Third request exceeds limit
    const res = await app.request('/test', { headers });
    expect(res.status).toBe(429);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('RATE_LIMITED');
  });

  it('sets Retry-After header on 429', async () => {
    const app = createTestApp(1, 30);
    const headers = { 'x-forwarded-for': '5.6.7.8' };

    await app.request('/test', { headers });
    const res = await app.request('/test', { headers });

    expect(res.status).toBe(429);
    const retryAfter = res.headers.get('Retry-After');
    expect(retryAfter).toBeTruthy();
    expect(Number(retryAfter)).toBeGreaterThan(0);
    expect(Number(retryAfter)).toBeLessThanOrEqual(30);
  });

  it('resets counter after window expires', async () => {
    const app = createTestApp(1, 1);
    const headers = { 'x-forwarded-for': '9.9.9.9' };

    await app.request('/test', { headers });
    const blocked = await app.request('/test', { headers });
    expect(blocked.status).toBe(429);

    // Advance past the 1-second window
    vi.advanceTimersByTime(1500);

    const res = await app.request('/test', { headers });
    expect(res.status).toBe(200);
  });

  it('tracks different IPs independently', async () => {
    const app = createTestApp(1, 60);

    const res1 = await app.request('/test', {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    });
    const res2 = await app.request('/test', {
      headers: { 'x-forwarded-for': '10.0.0.2' },
    });

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
  });
});
