import Link from 'next/link';
import { Plus } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@casalino/ui';
import { CONTRACT_STATUSES } from '@casalino/shared';
import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';

const STATUS_VARIANT_MAP: Record<string, 'secondary' | 'info' | 'success'> = {
  draft: 'secondary',
  sent: 'info',
  signed: 'success',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('de-CH').format(new Date(dateStr));
}

export default async function ContractsPage() {
  const token = await getAccessToken();

  if (!token) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Nicht authentifiziert.
      </div>
    );
  }

  const client = createApiClient(token);
  const result = await client.contracts.list();
  const items = result.items;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl">Vertraege</h1>
      </div>

      {items.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mieter</TableHead>
                  <TableHead>Objekt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Gesendet</TableHead>
                  <TableHead>Unterschrieben</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((contract) => {
                  const statusInfo = CONTRACT_STATUSES[contract.status as keyof typeof CONTRACT_STATUSES];
                  const variant = STATUS_VARIANT_MAP[contract.status] ?? 'secondary';

                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.applicantName}
                      </TableCell>
                      <TableCell>
                        {contract.listingAddress}, {contract.listingCity}
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant}>
                          {statusInfo?.label ?? contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(contract.sentAt)}</TableCell>
                      <TableCell>{formatDate(contract.signedAt)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/contracts/${contract.id}`}>
                            Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Noch keine Vertraege erstellt. Vertraege werden erstellt, wenn
            ein Bewerber als Mieter ausgewaehlt wird.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
