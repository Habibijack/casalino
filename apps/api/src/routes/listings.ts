import { Hono } from 'hono';
import type { AppEnv } from '../types';

export const listingsRouter = new Hono<AppEnv>()
  .get('/', (c) => {
    const orgId = c.get('orgId');
    return c.json({ success: true, data: { items: [], orgId } });
  })
  .get('/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ success: true, data: { id, message: 'Listing detail - Phase 2' } });
  })
  .post('/', (c) => {
    return c.json({ success: true, data: { message: 'Create listing - Phase 2' } }, 201);
  })
  .patch('/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ success: true, data: { id, message: 'Update listing - Phase 2' } });
  })
  .delete('/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ success: true, data: { id, message: 'Delete listing - Phase 2' } });
  });
