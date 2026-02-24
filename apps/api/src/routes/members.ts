import { Hono } from 'hono';
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
  updateOrganizationSchema,
} from '@casalino/shared';
import type { AppEnv } from '../types';
import { AppError } from '../lib/errors';
import { requireRole } from '../lib/query-helpers';
import {
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  getOrganization,
  updateOrganization,
} from '../services/members.service';
import { listActivity } from '../services/activity.service';

const DEFAULT_ACTIVITY_LIMIT = 50;
const MAX_ACTIVITY_LIMIT = 200;

export const membersRouter = new Hono<AppEnv>()

  // List activity log
  .get('/activity', async (c) => {
    const orgId = c.get('orgId');
    const rawLimit = c.req.query('limit');
    const limit = rawLimit
      ? Math.min(Math.max(1, Number(rawLimit) || DEFAULT_ACTIVITY_LIMIT), MAX_ACTIVITY_LIMIT)
      : DEFAULT_ACTIVITY_LIMIT;

    const entries = await listActivity(orgId, limit);
    return c.json({ success: true, data: entries });
  })

  // List members
  .get('/', async (c) => {
    const orgId = c.get('orgId');
    const members = await listMembers(orgId);
    return c.json({ success: true, data: members });
  })

  // Get organization details
  .get('/organization', async (c) => {
    const orgId = c.get('orgId');
    const org = await getOrganization(orgId);
    return c.json({ success: true, data: org });
  })

  // Update organization
  .patch('/organization', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin');

    const body = await c.req.json();
    const parsed = updateOrganizationSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validation(parsed.error.errors[0]?.message ?? 'Ungueltige Daten');
    }
    const org = await updateOrganization(orgId, userId, parsed.data);
    return c.json({ success: true, data: org });
  })

  // Invite member
  .post('/invite', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin');

    const body = await c.req.json();
    const parsed = inviteMemberSchema.safeParse(body);

    if (!parsed.success) {
      throw AppError.validation(
        parsed.error.errors[0]?.message ?? 'Ungueltige Daten',
      );
    }

    const member = await inviteMember(orgId, userId, parsed.data);
    return c.json({ success: true, data: member }, 201);
  })

  // Update member role
  .patch('/:id/role', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin');

    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateMemberRoleSchema.safeParse(body);

    if (!parsed.success) {
      throw AppError.validation(
        parsed.error.errors[0]?.message ?? 'Ungueltige Daten',
      );
    }

    const updated = await updateMemberRole(orgId, userId, id, parsed.data);
    return c.json({ success: true, data: updated });
  })

  // Remove member
  .delete('/:id', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin');

    const id = c.req.param('id');
    await removeMember(orgId, userId, id);
    return c.json({ success: true, data: { removed: true } });
  });
