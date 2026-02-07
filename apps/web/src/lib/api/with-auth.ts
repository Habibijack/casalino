import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export type AuthenticatedRequest = {
  userId: string;
  email: string;
  supabaseAuthId: string;
};

export async function withAuth(): Promise<AuthenticatedRequest | NextResponse> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, email')
    .eq('supabase_auth_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User profile not found' },
      },
      { status: 404 }
    );
  }

  return {
    userId: profile.id,
    email: profile.email,
    supabaseAuthId: user.id,
  };
}
