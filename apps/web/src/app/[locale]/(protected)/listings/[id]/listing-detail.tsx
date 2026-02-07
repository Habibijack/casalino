'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useChatContext } from '@/components/chat/chat-provider';
import { useRouter } from 'next/navigation';

type Listing = {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  postal_code: string | null;
  canton: string | null;
  address: string | null;
  rooms: string | null;
  area_m2: number | null;
  price_chf: number | null;
  floor: number | null;
  source: string;
  source_url: string;
  images: string[];
  features: string[];
  listing_language: string;
  created_at: string;
};

type Props = {
  listing: Listing;
  locale: string;
};

export function ListingDetail({ listing, locale }: Props) {
  const { openListingChat } = useChatContext();
  const router = useRouter();

  const formatPrice = (price: number | null) => {
    if (!price) return '–';
    return `CHF ${price.toLocaleString('de-CH')}`;
  };

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        ← Zurück
      </button>

      {/* Image Gallery */}
      <div className="relative rounded-xl overflow-hidden">
        {listing.images.length > 0 ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-2">
            {listing.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${listing.title} Bild ${i + 1}`}
                className="w-full h-64 object-cover rounded-xl snap-center flex-shrink-0"
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-48 bg-background flex items-center justify-center text-muted-foreground rounded-xl">
            Keine Bilder verfügbar
          </div>
        )}
      </div>

      {/* Price + Title */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(listing.price_chf)}
            <span className="text-sm font-normal text-muted-foreground">/Mt.</span>
          </span>
          <span className="px-2 py-0.5 bg-background border border-border rounded-full text-xs text-muted-foreground uppercase">
            {listing.source}
          </span>
        </div>
        <h1 className="text-xl font-bold font-heading">{listing.title}</h1>
        {listing.address && (
          <p className="text-sm text-muted-foreground">
            {[listing.address, listing.postal_code, listing.city].filter(Boolean).join(', ')}
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {listing.rooms && (
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-lg font-bold">{listing.rooms}</div>
              <div className="text-xs text-muted-foreground">Zimmer</div>
            </CardContent>
          </Card>
        )}
        {listing.area_m2 && (
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-lg font-bold">{listing.area_m2}</div>
              <div className="text-xs text-muted-foreground">m²</div>
            </CardContent>
          </Card>
        )}
        {listing.floor !== null && (
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-lg font-bold">{listing.floor}.</div>
              <div className="text-xs text-muted-foreground">OG</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Features */}
      {listing.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ausstattung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {listing.features.map((feature, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-background rounded-full text-sm border border-border"
                >
                  {feature}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {listing.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Beschreibung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pb-4">
        <Button
          className="w-full"
          onClick={() => openListingChat(listing.id, listing.title)}
        >
          Fragen zu diesem Inserat
        </Button>

        <a href={listing.source_url} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" className="w-full">
            Original auf {listing.source} ansehen
          </Button>
        </a>
      </div>
    </main>
  );
}
