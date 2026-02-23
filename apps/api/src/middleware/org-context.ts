import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../types';
import { supabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

function isValidOrgRole(role: string): role is 'admin' | 'editor' | 'viewer' {
  return role === 'admin' || role === 'editor' || role === 'viewer';
}

export const orgContextMiddleware = createMiddleware<AppEnv>(
  async (c, next) => {
    const userId = c.get('userId');

    const { data: membership } = await supabaseAdmin
      .from('org_members')
      .select('org_id, role')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (!membership) {
      throw AppError.forbidden('Keine Organisationsmitgliedschaft');
    }

    if (!isValidOrgRole(membership.role)) {
      throw AppError.forbidden('Invalid organization role');
    }

    c.set('orgId', membership.org_id);
    c.set('orgRole', membership.role);

    await next();
  },
);
