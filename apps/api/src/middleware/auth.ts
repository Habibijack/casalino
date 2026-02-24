import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../types';
import { getSupabaseAdmin } from '../lib/supabase';
import { AppError } from '../lib/errors';

function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1] ?? null;
}

export const authMiddleware = createMiddleware<AppEnv>(
  async (c, next) => {
    const token = extractBearerToken(c.req.header('Authorization'));

    if (!token) {
      throw AppError.unauthorized('Missing Bearer token');
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw AppError.unauthorized('Invalid or expired token');
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_auth_id', data.user.id)
      .maybeSingle();

    if (!profile) {
      throw AppError.unauthorized('User not found in database');
    }

    c.set('userId', profile.id);

    await next();
  },
);
