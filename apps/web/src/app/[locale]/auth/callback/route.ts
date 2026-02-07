import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/de';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Extract locale from URL path for error redirect
  const localeMatch = request.url.match(/\/(de|fr|it)\//);
  const locale = localeMatch ? localeMatch[1] : 'de';

  return NextResponse.redirect(
    `${origin}/${locale}/login?error=auth_callback_failed`
  );
}
