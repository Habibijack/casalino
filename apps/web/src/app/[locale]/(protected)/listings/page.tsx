import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ListingCard } from '@/components/listings/listing-card';
import { ListingsFilter } from './listings-filter';
import { getFavoriteIds, getFavoriteListings } from '@/lib/favorites/actions';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function ListingsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const filters = await searchParams;
  const tab = filters.tab ?? 'all';

  const supabase = await createSupabaseServerClient();
  const favoriteIds = await getFavoriteIds();

  if (tab === 'favorites') {
    const favorites = await getFavoriteListings();
    const listings = favorites
      .map((f) => {
        const l = f.listings;
        if (Array.isArray(l)) return l[0] ?? null;
        return l;
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);

    return (
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold font-heading">Inserate</h1>

        {/* Tabs */}
        <div className="flex gap-2">
          <a
            href={`/${locale}/listings`}
            className="px-4 py-2 rounded-full text-sm font-medium bg-background border border-border text-muted-foreground"
          >
            Alle
          </a>
          <a
            href={`/${locale}/listings?tab=favorites`}
            className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-white"
          >
            Favoriten ({favorites.length})
          </a>
        </div>

        {listings.length > 0 ? (
          <div className="space-y-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                locale={locale}
                isFavorited={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-medium">Noch keine Favoriten</p>
            <p className="text-sm mt-1">
              Klicke das Herz auf einem Inserat um es zu speichern.
            </p>
          </div>
        )}
      </main>
    );
  }

  // All listings
  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(20);

  if (filters.city) query = query.ilike('city', `%${filters.city}%`);
  if (filters.minPrice) query = query.gte('price_chf', parseInt(filters.minPrice));
  if (filters.maxPrice) query = query.lte('price_chf', parseInt(filters.maxPrice));
  if (filters.source) query = query.eq('source', filters.source);

  const { data: listings, count } = await query;

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold font-heading">Inserate</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        <a
          href={`/${locale}/listings`}
          className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-white"
        >
          Alle ({count ?? 0})
        </a>
        <a
          href={`/${locale}/listings?tab=favorites`}
          className="px-4 py-2 rounded-full text-sm font-medium bg-background border border-border text-muted-foreground"
        >
          Favoriten ({favoriteIds.length})
        </a>
      </div>

      <ListingsFilter locale={locale} currentFilters={filters} />

      {listings && listings.length > 0 ? (
        <div className="space-y-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              locale={locale}
              isFavorited={favoriteIds.includes(listing.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">Keine Inserate gefunden</p>
        </div>
      )}
    </main>
  );
}
