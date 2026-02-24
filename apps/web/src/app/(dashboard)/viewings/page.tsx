import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';
import { ViewingsPageClient } from './client';

export default async function ViewingsPage() {
  const token = await getAccessToken();

  if (!token) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Nicht authentifiziert.
      </div>
    );
  }

  const client = createApiClient(token);

  const [viewingsResult, applicationsResult] = await Promise.all([
    client.viewings.list({ upcoming: 'true' }),
    client.applications.list({ status: 'screening', limit: '100' }),
  ]);

  // Map applications for the create dialog
  const applicationOptions = applicationsResult.items.map((app) => ({
    id: app.id,
    applicantName: app.applicantName,
    listingId: app.listingId,
    listingAddress: app.listingAddress ?? '',
  }));

  return (
    <ViewingsPageClient
      viewings={viewingsResult.items}
      applications={applicationOptions}
    />
  );
}
