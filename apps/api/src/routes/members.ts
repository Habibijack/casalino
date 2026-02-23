import { Hono } from 'hono';
import type { AppEnv } from '../types';

export const membersRouter = new Hono<AppEnv>()
  .get('/', (c) => {
    const orgId = c.get('orgId');
    return c.json({ success: true, data: { items: [], orgId } });
  })
  .post('/invite', (c) => {
    return c.json({ success: true, data: { message: 'Invite member - Phase 2' } }, 201);
  })
  .patch('/:id/role', (c) => {
    const id = c.req.param('id');
    return c.json({ success: true, data: { id, message: 'Update member role - Phase 2' } });
  })
  .delete('/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ success: true, data: { id, message: 'Remove member - Phase 2' } });
  });
