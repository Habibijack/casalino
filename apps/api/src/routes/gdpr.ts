import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../types';
import { requireRole, writeAuditLog } from '../lib/query-helpers';
import { exportOrgData, softDeleteOrg } from '../services/gdpr.service';
import { AppError } from '../lib/errors';

const deleteConfirmationSchema = z.object({
  confirmation: z.string(),
});

export const gdprRouter = new Hono<AppEnv>()

  // ---------------------
  // POST /export — Export all org data (admin only)
  // ---------------------
  .post('/export', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin');

    const data = await exportOrgData(orgId);

    await writeAuditLog({
      orgId,
      userId,
      action: 'gdpr.data_exported',
      entityType: 'organization',
      entityId: orgId,
    });

    return c.json({ success: true, data });
  })

  // ---------------------
  // POST /delete — Soft-delete org (admin only)
  // ---------------------
  .post('/delete', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin');

    const body = await c.req.json();
    const parsed = deleteConfirmationSchema.safeParse(body);

    if (!parsed.success) {
      throw AppError.validation(
        'Bitte geben Sie LOESCHEN ein zur Bestaetigung',
      );
    }

    if (parsed.data.confirmation !== 'LOESCHEN') {
      return c.json(
        {
          success: false,
          error: {
            code: 'CONFIRMATION_REQUIRED',
            message:
              'Bitte geben Sie LOESCHEN ein zur Bestaetigung',
          },
        },
        400,
      );
    }

    const result = await softDeleteOrg(orgId, userId);
    return c.json({ success: true, data: result });
  });
