import { eq, and, isNull } from 'drizzle-orm';
import { listings } from '@casalino/db/schema';
import { getDb } from '../../lib/db';

/**
 * Generates an IDX 3.0 XML export for all live listings of an org.
 * IDX 3.0 is the standard Swiss real estate portal exchange format.
 */
export async function generateIdxExport(orgId: string): Promise<string> {
  const db = getDb();

  const liveListings = await db
    .select()
    .from(listings)
    .where(
      and(
        eq(listings.orgId, orgId),
        eq(listings.status, 'live'),
        isNull(listings.deletedAt),
      ),
    );

  const xmlItems = liveListings.map((listing) => buildIdxProperty(listing));

  return `<?xml version="1.0" encoding="UTF-8"?>
<container>
  <agency>
    <id>${escapeXml(orgId)}</id>
  </agency>
  <properties>
${xmlItems.join('\n')}
  </properties>
</container>`;
}

function buildIdxProperty(listing: {
  id: string;
  referenceNumber: string | null;
  address: string;
  plz: string;
  city: string;
  canton: string | null;
  rooms: string;
  areaSqm: number | null;
  priceChf: number;
  nkChf: number | null;
  floor: number | null;
  descriptionDe: string | null;
  descriptionFr: string | null;
  descriptionIt: string | null;
}): string {
  return `    <property>
      <id>${escapeXml(listing.id)}</id>
      <referenceId>${escapeXml(listing.referenceNumber ?? '')}</referenceId>
      <address>
        <street>${escapeXml(listing.address)}</street>
        <zipCode>${escapeXml(listing.plz)}</zipCode>
        <city>${escapeXml(listing.city)}</city>
        <state>${escapeXml(listing.canton ?? '')}</state>
        <country>CH</country>
      </address>
      <offerType>RENT</offerType>
      <category>APARTMENT</category>
      <numberOfRooms>${escapeXml(listing.rooms)}</numberOfRooms>
      <surfaceLiving>${listing.areaSqm ?? ''}</surfaceLiving>
      <floor>${listing.floor ?? ''}</floor>
      <price>
        <rentNet>${listing.priceChf}</rentNet>
        <rentExtra>${listing.nkChf ?? 0}</rentExtra>
        <currency>CHF</currency>
      </price>
      <descriptions>
        <description lang="de">${escapeXml(listing.descriptionDe ?? '')}</description>
        <description lang="fr">${escapeXml(listing.descriptionFr ?? '')}</description>
        <description lang="it">${escapeXml(listing.descriptionIt ?? '')}</description>
      </descriptions>
    </property>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
