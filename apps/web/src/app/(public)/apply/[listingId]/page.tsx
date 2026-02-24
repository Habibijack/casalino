import { cookies } from 'next/headers';
import { Card, CardContent } from '@casalino/ui';
import { ApplicationForm } from '@/components/applications/ApplicationForm';
import { getTranslations, type Locale } from '@/lib/i18n';
import { detectLocale, LOCALE_COOKIE_NAME } from '@/lib/i18n/detect-locale';

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

function getRoomsLabel(rooms: string, locale: Locale): string {
  const labels: Record<Locale, string> = {
    de: 'Zimmer',
    fr: 'pieces',
    it: 'locali',
  };
  return `${rooms} ${labels[locale]}`;
}

export default async function ApplyPage(
  props: {
    params: Promise<{ listingId: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  },
) {
  const { listingId } = await props.params;
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale = detectLocale(searchParams, cookieValue);
  const t = await getTranslations(locale, 'apply');
  const tc = await getTranslations(locale, 'common');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  const res = await fetch(`${API_BASE}/api/v1/public/listings/${listingId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {t('notFound')}
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
          {t('notAccepting')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">{t('title')}</h1>
        <p className="mt-1 text-muted-foreground">
          {t('forAddress')} {listing.address}, {listing.plz} {listing.city}
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="font-medium">{getRoomsLabel(listing.rooms, locale)}</p>
            <p className="text-sm text-muted-foreground">
              {listing.plz} {listing.city}
              {listing.canton && ` (${listing.canton})`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{formatPrice(listing.priceChf)}</p>
            {listing.nkChf && (
              <p className="text-xs text-muted-foreground">
                + {formatPrice(listing.nkChf)} {tc('additionalCosts')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <ApplicationForm
        listingId={listingId}
        listingAddress={listing.address}
        listingCity={listing.city}
        locale={locale}
      />
    </div>
  );
}
