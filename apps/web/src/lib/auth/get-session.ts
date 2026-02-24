import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { SessionUser } from '@casalino/shared';

function isValidOrgRole(role: string): role is 'admin' | 'editor' | 'viewer' {
  return role === 'admin' || role === 'editor' || role === 'viewer';
}

function extractOrgName(organizations: unknown): string {
  if (
    organizations !== null &&
    organizations !== undefined &&
    typeof organizations === 'object' &&
    'name' in organizations
  ) {
    const obj: Record<string, unknown> = organizations;
    const name = obj['name'];
    if (typeof name === 'string') return name;
  }
  return 'Unbekannt';
}

export async function getSession(): Promise<SessionUser | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('id, email, full_name, avatar_url')
    .eq('supabase_auth_id', user.id)
    .maybeSingle();

  if (!profile) return null;

  // Get org membership (may not exist for new users)
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role, organizations(name)')
    .eq('user_id', profile.id)
    .limit(1)
    .maybeSingle();

  // Return session even without org membership
  if (!membership) {
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      orgId: null,
      orgRole: null,
      orgName: null,
    };
  }

  const role = membership.role;
  const validRole = isValidOrgRole(role) ? role : null;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    orgId: membership.org_id,
    orgRole: validRole,
    orgName: extractOrgName(membership.organizations),
  };
}
