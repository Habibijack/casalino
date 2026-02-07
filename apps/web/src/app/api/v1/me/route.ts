import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';

export async function GET() {
  const auth = await withAuth();

  // If auth returned a NextResponse, it's an error
  if (auth instanceof NextResponse) {
    return auth;
  }

  return NextResponse.json({
    success: true,
    data: {
      userId: auth.userId,
      email: auth.email,
    },
  });
}
