import { Hono } from 'hono';
import type { AppEnv } from '../types';
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
  paginationSchema,
} from '@casalino/shared';
import {
  listApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
} from '../services/applications.service';
import { AppError } from '../lib/errors';
import { requireRole } from '../lib/query-helpers';

// ---------------------
// Protected routes (require auth + org context)
// ---------------------

export const applicationsRouter = new Hono<AppEnv>()

  .get('/', async (c) => {
    const orgId = c.get('orgId');
    const raw = Object.fromEntries(new URL(c.req.url).searchParams);

    const parsed = paginationSchema.safeParse({
      ...raw,
      limit: raw.limit ? Number(raw.limit) : undefined,
    });
    if (!parsed.success) {
      throw AppError.validation(parsed.error.issues[0]?.message ?? 'Invalid filters');
    }

    const result = await listApplications({
      orgId,
      listingId: raw.listingId,
      status: raw.status,
      ...parsed.data,
    });
    return c.json({ success: true, data: result });
  })

  .get('/:id', async (c) => {
    const orgId = c.get('orgId');
    const id = c.req.param('id');
    const application = await getApplicationById(orgId, id);
    return c.json({ success: true, data: application });
  })

  .patch('/:id/status', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateApplicationStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validation(parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const application = await updateApplicationStatus(orgId, userId, id, parsed.data);
    return c.json({ success: true, data: application });
  });

// ---------------------
// Public route (no auth — applicants submit here)
// ---------------------

export const publicApplicationsRouter = new Hono()

  .post('/', async (c) => {
    const body = await c.req.json();
    const parsed = createApplicationSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validation(parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const application = await createApplication(parsed.data);
    return c.json({ success: true, data: { id: application.id } }, 201);
  });
