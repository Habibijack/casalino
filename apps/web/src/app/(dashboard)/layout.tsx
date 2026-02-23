import { redirect } from 'next/navigation';
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

  return (
    <div className="flex h-screen">
      <Sidebar
        orgName={session.orgName}
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
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
