import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { FavoriteButton } from './favorite-button';

type ListingData = {
  id: string;
  title: string;
  city: string | null;
  rooms: string | number | null;
  price_chf: number | null;
  area_m2: number | null;
  images: string[] | null;
  source: string;
};

type ListingCardProps = {
  listing: ListingData;
  locale: string;
  isFavorited?: boolean;
};

function formatPrice(price: number | null) {
  if (!price) return '–';
  return `CHF ${price.toLocaleString('de-CH')}`;
}

export function ListingCard({ listing, locale, isFavorited = false }: ListingCardProps) {
  return (
    <Link href={`/${locale}/listings/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex">
          {/* Thumbnail */}
          <div className="relative w-28 h-28 flex-shrink-0 bg-background">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">
                🏠
              </div>
            )}
            <div className="absolute bottom-1 right-1">
              <FavoriteButton
                listingId={listing.id}
                isFavorited={isFavorited}
              />
            </div>
          </div>

          {/* Info */}
          <CardContent className="flex-1 p-3 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm line-clamp-2 leading-snug">
                {listing.title}
              </h3>
              {listing.city && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {listing.city}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-primary">
                {formatPrice(listing.price_chf)}
                <span className="text-xs font-normal text-muted-foreground">/Mt.</span>
              </span>
              <div className="flex gap-2 text-xs text-muted-foreground">
                {listing.rooms && <span>{listing.rooms} Zi.</span>}
                {listing.area_m2 && <span>{listing.area_m2} m²</span>}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
