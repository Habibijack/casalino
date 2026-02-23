import { Hono } from 'hono';
import type { AppEnv } from '../types';

export const viewingsRouter = new Hono<AppEnv>()
  .get('/', (c) => {
    const orgId = c.get('orgId');
    return c.json({ success: true, data: { items: [], orgId } });
  })
  .post('/', (c) => {
    return c.json({ success: true, data: { message: 'Create viewing - Phase 2' } }, 201);
  })
  .patch('/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ success: true, data: { id, message: 'Update viewing - Phase 2' } });
  })
  .delete('/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ success: true, data: { id, message: 'Delete viewing - Phase 2' } });
  });
