import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';
import { getSession } from '@/lib/auth/get-session';
import { SettingsPageClient } from './client';

export default async function SettingsPage() {
  const token = await getAccessToken();
  const session = await getSession();

  if (!token || !session) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Nicht authentifiziert.
      </div>
    );
  }

  const client = createApiClient(token);

  const [organization, members] = await Promise.all([
    client.members.getOrganization(),
    client.members.list(),
  ]);

  return (
    <SettingsPageClient
      organization={organization}
      members={members}
      currentUserId={session.id}
      isAdmin={session.orgRole === 'admin'}
      token={token}
    />
  );
}
