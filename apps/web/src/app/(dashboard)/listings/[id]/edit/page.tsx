import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@casalino/ui';
import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';
import { EditListingClient } from './client';

export default async function EditListingPage(
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const token = await getAccessToken();

  if (!token) {
    return <div className="py-12 text-center text-muted-foreground">Nicht authentifiziert.</div>;
  }

  const client = createApiClient(token);
  const listing = await client.listings.get(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/listings/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-heading text-3xl">Inserat bearbeiten</h1>
      </div>

      <EditListingClient listing={listing} />
    </div>
  );
}
