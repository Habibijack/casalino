import { Hono } from 'hono';
import type { AppEnv } from '../types';

export const contractsRouter = new Hono<AppEnv>()
  .get('/', (c) => {
    const orgId = c.get('orgId');
    return c.json({ success: true, data: { items: [], orgId } });
  })
  .get('/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ success: true, data: { id, message: 'Contract detail - Phase 2' } });
  })
  .post('/', (c) => {
    return c.json({ success: true, data: { message: 'Create contract - Phase 2' } }, 201);
  })
  .patch('/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ success: true, data: { id, message: 'Update contract - Phase 2' } });
  });
