import { createSupabaseServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ListingsPage({ params }: Props) {
  const { locale } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, city, rooms, price_chf, area_m2, images, source')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const formatPrice = (price: number | null) => {
    if (!price) return '–';
    return `CHF ${price.toLocaleString('de-CH')}`;
  };

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold font-heading">Inserate</h1>

      {!listings || listings.length === 0 ? (
        <p className="text-muted-foreground text-sm">Keine Inserate gefunden.</p>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/${locale}/listings/${listing.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer mb-3">
                <div className="flex">
                  {/* Thumbnail */}
                  <div className="w-28 h-28 flex-shrink-0 bg-background">
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
          ))}
        </div>
      )}
    </main>
  );
}
