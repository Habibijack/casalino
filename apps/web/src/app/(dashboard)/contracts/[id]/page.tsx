import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';
import { ContractDetailClient } from './client';

export default async function ContractDetailPage(
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const token = await getAccessToken();

  if (!token) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Nicht authentifiziert.
      </div>
    );
  }

  const client = createApiClient(token);
  const contract = await client.contracts.get(id);

  return <ContractDetailClient contract={contract} />;
}
