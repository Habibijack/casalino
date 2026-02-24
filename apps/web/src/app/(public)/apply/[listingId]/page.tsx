import { Card, CardContent, Badge } from '@casalino/ui';
import { ApplicationForm } from '@/components/applications/ApplicationForm';

interface PublicListingInfo {
  id: string;
  address: string;
  plz: string;
  city: string;
  canton: string | null;
  rooms: string;
  priceChf: number;
  nkChf: number | null;
  status: string;
  descriptionDe: string | null;
}

function formatPrice(chf: number): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(chf);
}

export default async function ApplyPage(
  props: { params: Promise<{ listingId: string }> },
) {
  const { listingId } = await props.params;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  const res = await fetch(`${API_BASE}/api/v1/public/listings/${listingId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Dieses Inserat wurde nicht gefunden oder ist nicht mehr verfuegbar.
        </CardContent>
      </Card>
    );
  }

  const json = await res.json();
  const listing: PublicListingInfo = json.data;

  if (listing.status !== 'live' && listing.status !== 'viewing') {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Dieses Inserat nimmt derzeit keine Bewerbungen an.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Bewerbung einreichen</h1>
        <p className="mt-1 text-muted-foreground">
          fuer {listing.address}, {listing.plz} {listing.city}
        </p>
      </div>

      {/* Listing Summary */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="font-medium">{listing.rooms} Zimmer</p>
            <p className="text-sm text-muted-foreground">
              {listing.plz} {listing.city}
              {listing.canton && ` (${listing.canton})`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{formatPrice(listing.priceChf)}</p>
            {listing.nkChf && (
              <p className="text-xs text-muted-foreground">
                + {formatPrice(listing.nkChf)} NK
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <ApplicationForm
        listingId={listingId}
        listingAddress={listing.address}
        listingCity={listing.city}
      />
    </div>
  );
}
