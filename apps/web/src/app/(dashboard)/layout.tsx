import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getSession } from '@/lib/auth/get-session';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { UserMenu } from '@/components/layout/UserMenu';
import { CommandPalette } from '@/components/layout/CommandPalette';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // User is authenticated but has no organization
  if (!session.orgId) {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') ?? '';

    // Redirect to onboarding if not already there
    if (!pathname.startsWith('/onboarding')) {
      redirect('/onboarding');
    }

    // Render onboarding page without sidebar
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        orgName={session.orgName ?? 'Organisation'}
        userName={session.fullName}
        userEmail={session.email}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header>
          <UserMenu
            user={{
              fullName: session.fullName,
              email: session.email,
              avatarUrl: session.avatarUrl,
            }}
          />
        </Header>
        <main className="flex-1 overflow-auto p-6">
          {children}
          <footer className="mt-12 border-t pt-4 pb-2">
            <nav className="flex gap-4">
              <Link
                href="/impressum"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Impressum
              </Link>
              <Link
                href="/agb"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                AGB
              </Link>
              <Link
                href="/datenschutz"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Datenschutz
              </Link>
            </nav>
          </footer>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
