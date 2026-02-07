import { createSupabaseServerClient } from '@/lib/supabase/server';

export type SessionUser = {
  id: string;
  email: string;
  fullName: string | null;
  preferredLanguage: string;
  avatarUrl: string | null;
  tier: string;
};

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  // Get user profile from our users table
  const { data: profile } = await supabase
    .from('users')
    .select('id, email, full_name, preferred_language, avatar_url')
    .eq('supabase_auth_id', user.id)
    .single();

  if (!profile) return null;

  // Get subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', profile.id)
    .eq('status', 'active')
    .single();

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    preferredLanguage: profile.preferred_language,
    avatarUrl: profile.avatar_url,
    tier: subscription?.tier ?? 'free',
  };
}
