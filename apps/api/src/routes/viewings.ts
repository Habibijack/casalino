import { Hono } from 'hono';
import { createViewingSchema, updateViewingStatusSchema, paginationSchema } from '@casalino/shared';
import type { AppEnv } from '../types';
import { AppError } from '../lib/errors';
import { requireRole } from '../lib/query-helpers';
import {
  listViewings,
  getViewingById,
  createViewing,
  updateViewingStatus,
  deleteViewing,
} from '../services/viewings.service';

export const viewingsRouter = new Hono<AppEnv>()

  // List viewings
  .get('/', async (c) => {
    const orgId = c.get('orgId');
    const params = Object.fromEntries(new URL(c.req.url).searchParams);

    const parsed = paginationSchema.safeParse({
      cursor: params['cursor'],
      limit: params['limit'] ? Number(params['limit']) : undefined,
      direction: params['direction'],
    });

    if (!parsed.success) {
      throw AppError.validation(parsed.error.errors[0]?.message ?? 'Ungueltige Parameter');
    }

    const result = await listViewings({
      orgId,
      listingId: params['listingId'],
      status: params['status'],
      upcoming: params['upcoming'] === 'true',
      ...parsed.data,
    });

    return c.json({ success: true, data: result });
  })

  // Get single viewing
  .get('/:id', async (c) => {
    const orgId = c.get('orgId');
    const id = c.req.param('id');
    const viewing = await getViewingById(orgId, id);
    return c.json({ success: true, data: viewing });
  })

  // Create viewing
  .post('/', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const body = await c.req.json();
    const parsed = createViewingSchema.safeParse(body);

    if (!parsed.success) {
      throw AppError.validation(parsed.error.errors[0]?.message ?? 'Ungueltige Daten');
    }

    const viewing = await createViewing(orgId, userId, parsed.data);
    return c.json({ success: true, data: viewing }, 201);
  })

  // Update viewing status
  .patch('/:id', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateViewingStatusSchema.safeParse(body);

    if (!parsed.success) {
      throw AppError.validation(parsed.error.errors[0]?.message ?? 'Ungueltige Daten');
    }

    const updated = await updateViewingStatus(orgId, userId, id, parsed.data);
    return c.json({ success: true, data: updated });
  })

  // Delete viewing
  .delete('/:id', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const id = c.req.param('id');
    await deleteViewing(orgId, userId, id);
    return c.json({ success: true, data: { deleted: true } });
  });
