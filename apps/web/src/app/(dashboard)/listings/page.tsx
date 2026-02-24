import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';
import { ListingsPageClient } from '@/components/listings/ListingsPageClient';

export default async function ListingsPage() {
  const token = await getAccessToken();

  if (!token) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Nicht authentifiziert.
      </div>
    );
  }

  const client = createApiClient(token);
  const data = await client.listings.list();

  return <ListingsPageClient listings={data.items} />;
}
