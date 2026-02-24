import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@casalino/ui';
import { LISTING_STATUSES } from '@casalino/shared';
import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';
import { ListingStatusActions } from './status-actions';
import { GenerateTextButton } from './generate-text-button';

const STATUS_VARIANT_MAP: Record<string, 'secondary' | 'success' | 'info' | 'accent'> = {
  draft: 'secondary',
  live: 'success',
  viewing: 'info',
  assigned: 'accent',
  archived: 'secondary',
};

function formatPrice(chf: number): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(chf);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('de-CH').format(new Date(dateStr));
}

export default async function ListingDetailPage(
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const token = await getAccessToken();

  if (!token) {
    return <div className="py-12 text-center text-muted-foreground">Nicht authentifiziert.</div>;
  }

  const client = createApiClient(token);
  const listing = await client.listings.get(id);
  const statusInfo = LISTING_STATUSES[listing.status as keyof typeof LISTING_STATUSES];
  const variant = STATUS_VARIANT_MAP[listing.status] ?? 'secondary';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/listings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-3xl">{listing.address}</h1>
            <p className="text-muted-foreground">
              {listing.plz} {listing.city}
              {listing.canton && ` (${listing.canton})`}
              {listing.referenceNumber && ` — #${listing.referenceNumber}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={variant} className="text-sm">
            {statusInfo?.label ?? listing.status}
          </Badge>
          {(listing.status === 'draft' || listing.status === 'live') && (
            <GenerateTextButton
              listingId={id}
              hasDescriptions={Boolean(listing.descriptionDe)}
            />
          )}
          <Button variant="outline" asChild>
            <Link href={`/listings/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Bearbeiten
            </Link>
          </Button>
          <ListingStatusActions listingId={id} currentStatus={listing.status} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Objektdetails</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Zimmer</dt>
              <dd className="font-medium">{listing.rooms}</dd>

              <dt className="text-muted-foreground">Flaeche</dt>
              <dd className="font-medium">
                {listing.areaSqm ? `${listing.areaSqm} m\u00b2` : '-'}
              </dd>

              <dt className="text-muted-foreground">Stockwerk</dt>
              <dd className="font-medium">{listing.floor ?? '-'}</dd>

              <dt className="text-muted-foreground">Miete</dt>
              <dd className="font-medium">{formatPrice(listing.priceChf)}</dd>

              <dt className="text-muted-foreground">Nebenkosten</dt>
              <dd className="font-medium">
                {listing.nkChf ? formatPrice(listing.nkChf) : '-'}
              </dd>

              <dt className="text-muted-foreground">Verfuegbar ab</dt>
              <dd className="font-medium">{formatDate(listing.availableFrom)}</dd>
            </dl>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistik</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Bewerbungen</dt>
              <dd className="font-medium">{listing.applicationCount}</dd>

              <dt className="text-muted-foreground">Erstellt</dt>
              <dd className="font-medium">{formatDate(listing.createdAt)}</dd>

              <dt className="text-muted-foreground">Publiziert</dt>
              <dd className="font-medium">{formatDate(listing.publishedAt)}</dd>

              <dt className="text-muted-foreground">Features</dt>
              <dd className="font-medium">
                {listing.features.length > 0
                  ? listing.features.join(', ')
                  : '-'}
              </dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {(listing.descriptionDe || listing.descriptionFr || listing.descriptionIt) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Beschreibung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {listing.descriptionDe && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Deutsch</p>
                <p className="whitespace-pre-wrap text-sm">{listing.descriptionDe}</p>
              </div>
            )}
            {listing.descriptionFr && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Franzoesisch</p>
                <p className="whitespace-pre-wrap text-sm">{listing.descriptionFr}</p>
              </div>
            )}
            {listing.descriptionIt && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Italienisch</p>
                <p className="whitespace-pre-wrap text-sm">{listing.descriptionIt}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
