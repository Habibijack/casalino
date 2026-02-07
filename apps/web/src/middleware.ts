import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { routing } from '@/i18n/routing';

// Public routes that don't require auth
const publicRoutes = ['/login', '/auth/callback', '/api/health'];

// Create intl middleware
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always refresh Supabase session
  const supabaseResponse = await updateSession(request);

  // 2. Handle i18n routing
  const intlResponse = intlMiddleware(request);

  // 3. Merge cookies from Supabase into intl response
  if (supabaseResponse.cookies.getAll().length > 0) {
    const response = intlResponse || NextResponse.next();
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, cookie);
    });
    return response;
  }

  return intlResponse;
}

export const config = {
  matcher: ['/', '/(de|fr|it)/:path*'],
};
