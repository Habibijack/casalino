'use client';

import { signOut } from '@/lib/auth/actions';

export function SignOutButton({ locale }: { locale: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut(locale)}
      className="text-sm text-muted-foreground hover:text-destructive transition-colors"
    >
      Abmelden
    </button>
  );
}
