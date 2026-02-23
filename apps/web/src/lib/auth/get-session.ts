import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { SessionUser } from '@casalino/shared';

export async function getSession(): Promise<SessionUser | null> {
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
    .single();

  if (!profile) return null;

  // Get org membership
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role, organizations(name)')
    .eq('user_id', profile.id)
    .limit(1)
    .single();

  if (!membership) return null;

  const orgData = membership.organizations as { name: string } | null;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    orgId: membership.org_id,
    orgRole: membership.role as SessionUser['orgRole'],
    orgName: orgData?.name ?? 'Unbekannt',
  };
}
