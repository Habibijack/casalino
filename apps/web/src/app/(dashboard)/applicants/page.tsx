import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';
import { ApplicantsPageClient } from './client';

export default async function ApplicantsPage() {
  const token = await getAccessToken();

  if (!token) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Nicht authentifiziert.
      </div>
    );
  }

  const client = createApiClient(token);
  const data = await client.applications.list();

  return <ApplicantsPageClient applications={data.items} />;
}
