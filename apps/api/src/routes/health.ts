import { Hono } from 'hono';

export const healthRouter = new Hono()
  .get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
