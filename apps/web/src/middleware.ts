import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const publicPaths = ['/login', '/register', '/auth/callback', '/api/health', '/', '/pricing', '/apply', '/sign', '/book'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always refresh Supabase session
  const response = await updateSession(request);

  // Pass current pathname via header for layout-level redirect decisions
  response.headers.set('x-pathname', pathname);

  // Allow public paths
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isPublic) {
    return response;
  }

  // Protected routes are guarded via layout-level session check
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
