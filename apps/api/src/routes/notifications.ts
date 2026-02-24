import { Hono } from 'hono';
import type { AppEnv } from '../types';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../services/notification.service';
import { AppError } from '../lib/errors';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const notificationsRouter = new Hono<AppEnv>()

  // ---------------------
  // GET / — List notifications (last 50)
  // ---------------------
  .get('/', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const unread = c.req.query('unread');
    const unreadOnly = unread === 'true';

    const items = await getNotifications(orgId, userId, { unreadOnly });
    return c.json({ success: true, data: items });
  })

  // ---------------------
  // GET /count — Unread count
  // ---------------------
  .get('/count', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');

    const count = await getUnreadCount(orgId, userId);
    return c.json({ success: true, data: { count } });
  })

  // ---------------------
  // PATCH /:id/read — Mark single as read
  // ---------------------
  .patch('/:id/read', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');

    if (!UUID_RE.test(id)) {
      throw AppError.validation('Ungueltige Benachrichtigungs-ID');
    }

    await markAsRead(userId, id);
    return c.json({ success: true, data: { read: true } });
  })

  // ---------------------
  // POST /read-all — Mark all as read
  // ---------------------
  .post('/read-all', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');

    await markAllAsRead(orgId, userId);
    return c.json({ success: true, data: { readAll: true } });
  });
