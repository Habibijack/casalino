import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';
import { NotificationsClient } from './client';

export default async function NotificationsPage() {
  const token = await getAccessToken();

  if (!token) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Nicht authentifiziert.
      </div>
    );
  }

  const client = createApiClient(token);
  const notifications = await client.notifications.list();

  return <NotificationsClient notifications={notifications} />;
}
