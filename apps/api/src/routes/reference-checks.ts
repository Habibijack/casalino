import { Hono } from 'hono';
import type { AppEnv } from '../types';
import {
  createReferenceCheckSchema,
  submitReferenceSchema,
} from '@casalino/shared';
import { AppError } from '../lib/errors';
import { requireRole } from '../lib/query-helpers';
import {
  createReferenceCheck,
  getByApplicationId,
  getByToken,
  submitReference,
  sendReminder,
} from '../services/reference.service';

// ---------------------
// Protected routes (require auth + org context)
// ---------------------

export const referenceChecksRouter = new Hono<AppEnv>()

  .post('/', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const body = await c.req.json();
    const parsed = createReferenceCheckSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validation(
        parsed.error.issues[0]?.message ?? 'Ungueltige Daten',
      );
    }

    const refCheck = await createReferenceCheck(
      orgId,
      userId,
      parsed.data,
    );
    return c.json({ success: true, data: refCheck }, 201);
  })

  .post('/:id/remind', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const id = c.req.param('id');
    const refCheck = await sendReminder(orgId, userId, id);
    return c.json({ success: true, data: refCheck });
  })

  .get('/application/:applicationId', async (c) => {
    const orgId = c.get('orgId');
    const applicationId = c.req.param('applicationId');
    const refCheck = await getByApplicationId(orgId, applicationId);
    return c.json({ success: true, data: refCheck });
  });

// ---------------------
// Public routes (no auth -- landlords access via token)
// ---------------------

export const publicReferenceRouter = new Hono()

  .get('/:token', async (c) => {
    const token = c.req.param('token');
    const refCheck = await getByToken(token);
    return c.json({ success: true, data: refCheck });
  })

  .post('/:token/submit', async (c) => {
    const token = c.req.param('token');
    const body = await c.req.json();
    const parsed = submitReferenceSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validation(
        parsed.error.issues[0]?.message ?? 'Ungueltige Daten',
      );
    }

    const refCheck = await submitReference(token, parsed.data);
    return c.json({ success: true, data: refCheck });
  });
