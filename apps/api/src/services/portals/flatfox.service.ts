import { eq } from 'drizzle-orm';
import { listings } from '@casalino/db/schema';
import { getDb } from '../../lib/db';
import { AppError } from '../../lib/errors';

interface FlatfoxListingPayload {
  title: string;
  street: string;
  zip: string;
  city: string;
  rent_gross: number;
  rent_charges: number | null;
  number_of_rooms: string;
  floor: number | null;
  living_space: number | null;
  description_de: string | null;
}

/**
 * Publishes a listing to Flatfox via their REST API.
 * Falls back to mock when FLATFOX_API_URL is not configured.
 */
export async function publishToFlatfox(
  orgId: string,
  listingId: string,
  apiKey: string,
): Promise<{ flatfoxId: string }> {
  const db = getDb();

  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing || listing.orgId !== orgId) {
    throw AppError.notFound('Inserat');
  }

  if (listing.status !== 'live') {
    throw AppError.validation('Nur Live-Inserate koennen publiziert werden');
  }

  const payload: FlatfoxListingPayload = {
    title: `${listing.rooms}-Zimmer-Wohnung, ${listing.city}`,
    street: listing.address,
    zip: listing.plz,
    city: listing.city,
    rent_gross: listing.priceChf,
    rent_charges: listing.nkChf,
    number_of_rooms: String(listing.rooms),
    floor: listing.floor,
    living_space: listing.areaSqm,
    description_de: listing.descriptionDe,
  };

  let flatfoxId: string;

  const flatfoxBaseUrl = process.env.FLATFOX_API_URL;
  if (flatfoxBaseUrl) {
    // Real Flatfox API call
    const res = await fetch(`${flatfoxBaseUrl}/api/v1/listing/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[flatfox] API error:', res.status, text);
      throw AppError.validation(`Flatfox Fehler: ${res.status}`);
    }

    const data = await res.json();
    flatfoxId = String(data.pk ?? data.id ?? `ff-${Date.now()}`);
    console.log(`[flatfox] Published: ${flatfoxId}`);
  } else {
    // Mock mode
    console.log('[flatfox:mock] Publishing listing:', payload.title);
    flatfoxId = `ff-mock-${Date.now()}`;
  }

  // Update listing with portal ID
  const portalIds = (listing.portalIds ?? {}) as Record<string, string>;
  portalIds['flatfox'] = flatfoxId;

  await db
    .update(listings)
    .set({
      portalIds,
      updatedAt: new Date(),
    })
    .where(eq(listings.id, listingId));

  return { flatfoxId };
}

/**
 * Unpublish from Flatfox
 */
export async function unpublishFromFlatfox(
  orgId: string,
  listingId: string,
): Promise<void> {
  const db = getDb();

  const [listing] = await db
    .select({ id: listings.id, orgId: listings.orgId, portalIds: listings.portalIds })
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing || listing.orgId !== orgId) {
    throw AppError.notFound('Inserat');
  }

  const portalIds = (listing.portalIds ?? {}) as Record<string, string>;
  const flatfoxId = portalIds['flatfox'];

  // Try to delete from Flatfox API
  const flatfoxBaseUrl = process.env.FLATFOX_API_URL;
  if (flatfoxBaseUrl && flatfoxId && !flatfoxId.startsWith('ff-mock')) {
    try {
      await fetch(`${flatfoxBaseUrl}/api/v1/listing/${flatfoxId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Token ${process.env.FLATFOX_API_KEY ?? ''}` },
      });
    } catch (err) {
      console.error('[flatfox] Failed to delete from API:', err);
    }
  }

  delete portalIds['flatfox'];

  await db
    .update(listings)
    .set({ portalIds, updatedAt: new Date() })
    .where(eq(listings.id, listingId));
}
