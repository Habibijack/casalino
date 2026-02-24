import { eq, and, isNull, desc, ilike, or, sql } from 'drizzle-orm';
import { listings } from '@casalino/db/schema';
import type {
  CreateListingInput,
  UpdateListingInput,
  UpdateListingStatusInput,
  ListingFilterInput,
} from '@casalino/shared';
import { getDb } from '../lib/db';
import { AppError } from '../lib/errors';
import {
  buildCursorCondition,
  buildCursorResult,
  countRows,
  writeAuditLog,
} from '../lib/query-helpers';

// ---------------------
// List
// ---------------------

export async function listListings(
  orgId: string,
  filters: ListingFilterInput,
) {
  const db = getDb();
  const { cursor, limit, direction, status, city, canton, search } = filters;

  const conditions = [
    eq(listings.orgId, orgId),
    isNull(listings.deletedAt),
  ];

  if (status) {
    conditions.push(eq(listings.status, status));
  }
  if (city) {
    conditions.push(ilike(listings.city, `%${city}%`));
  }
  if (canton) {
    conditions.push(eq(listings.canton, canton));
  }
  if (search) {
    conditions.push(
      or(
        ilike(listings.address, `%${search}%`),
        ilike(listings.city, `%${search}%`),
        ilike(listings.referenceNumber, `%${search}%`),
      )!,
    );
  }

  const cursorCondition = buildCursorCondition({
    cursor,
    direction,
    idColumn: listings.id,
  });
  if (cursorCondition) {
    conditions.push(cursorCondition);
  }

  const whereClause = and(...conditions);

  const [rows, totalCount] = await Promise.all([
    db
      .select()
      .from(listings)
      .where(whereClause)
      .orderBy(desc(listings.createdAt))
      .limit(limit + 1),
    countRows(listings, and(
      eq(listings.orgId, orgId),
      isNull(listings.deletedAt),
      ...(status ? [eq(listings.status, status)] : []),
    )),
  ]);

  return buildCursorResult(rows, limit, totalCount);
}

// ---------------------
// Get by ID
// ---------------------

export async function getListingById(
  orgId: string,
  listingId: string,
) {
  const db = getDb();

  const [listing] = await db
    .select()
    .from(listings)
    .where(
      and(
        eq(listings.id, listingId),
        eq(listings.orgId, orgId),
        isNull(listings.deletedAt),
      ),
    )
    .limit(1);

  if (!listing) {
    throw AppError.notFound('Inserat');
  }

  return listing;
}

// ---------------------
// Create
// ---------------------

export async function createListing(
  orgId: string,
  userId: string,
  input: CreateListingInput,
) {
  const db = getDb();

  const [listing] = await db
    .insert(listings)
    .values({
      orgId,
      referenceNumber: input.referenceNumber ?? null,
      address: input.address,
      plz: input.plz,
      city: input.city,
      canton: input.canton ?? null,
      rooms: String(input.rooms),
      areaSqm: input.areaSqm ?? null,
      priceChf: input.priceChf,
      nkChf: input.nkChf ?? null,
      floor: input.floor ?? null,
      availableFrom: input.availableFrom
        ? new Date(input.availableFrom)
        : null,
      descriptionDe: input.descriptionDe ?? null,
      descriptionFr: input.descriptionFr ?? null,
      descriptionIt: input.descriptionIt ?? null,
      features: input.features,
      status: 'draft',
    })
    .returning();

  await writeAuditLog({
    orgId,
    userId,
    action: 'listing.created',
    entityType: 'listing',
    entityId: listing!.id,
  });

  return listing!;
}

// ---------------------
// Update
// ---------------------

export async function updateListing(
  orgId: string,
  userId: string,
  listingId: string,
  input: UpdateListingInput,
) {
  // Verify ownership
  await getListingById(orgId, listingId);

  const db = getDb();

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (input.referenceNumber !== undefined) updateData.referenceNumber = input.referenceNumber;
  if (input.address !== undefined) updateData.address = input.address;
  if (input.plz !== undefined) updateData.plz = input.plz;
  if (input.city !== undefined) updateData.city = input.city;
  if (input.canton !== undefined) updateData.canton = input.canton;
  if (input.rooms !== undefined) updateData.rooms = String(input.rooms);
  if (input.areaSqm !== undefined) updateData.areaSqm = input.areaSqm;
  if (input.priceChf !== undefined) updateData.priceChf = input.priceChf;
  if (input.nkChf !== undefined) updateData.nkChf = input.nkChf;
  if (input.floor !== undefined) updateData.floor = input.floor;
  if (input.availableFrom !== undefined) {
    updateData.availableFrom = input.availableFrom
      ? new Date(input.availableFrom)
      : null;
  }
  if (input.descriptionDe !== undefined) updateData.descriptionDe = input.descriptionDe;
  if (input.descriptionFr !== undefined) updateData.descriptionFr = input.descriptionFr;
  if (input.descriptionIt !== undefined) updateData.descriptionIt = input.descriptionIt;
  if (input.features !== undefined) updateData.features = input.features;

  const [updated] = await db
    .update(listings)
    .set(updateData)
    .where(and(eq(listings.id, listingId), eq(listings.orgId, orgId)))
    .returning();

  await writeAuditLog({
    orgId,
    userId,
    action: 'listing.updated',
    entityType: 'listing',
    entityId: listingId,
    details: { fields: Object.keys(input) },
  });

  return updated!;
}

// ---------------------
// Update Status
// ---------------------

export async function updateListingStatus(
  orgId: string,
  userId: string,
  listingId: string,
  input: UpdateListingStatusInput,
) {
  const existing = await getListingById(orgId, listingId);

  const db = getDb();

  const updateData: Record<string, unknown> = {
    status: input.status,
    updatedAt: new Date(),
  };

  // Track publish date
  if (input.status === 'live' && existing.status === 'draft') {
    updateData.publishedAt = new Date();
  }

  const [updated] = await db
    .update(listings)
    .set(updateData)
    .where(and(eq(listings.id, listingId), eq(listings.orgId, orgId)))
    .returning();

  await writeAuditLog({
    orgId,
    userId,
    action: 'listing.status_changed',
    entityType: 'listing',
    entityId: listingId,
    details: { from: existing.status, to: input.status },
  });

  return updated!;
}

// ---------------------
// Soft Delete
// ---------------------

export async function softDeleteListing(
  orgId: string,
  userId: string,
  listingId: string,
) {
  await getListingById(orgId, listingId);

  const db = getDb();

  await db
    .update(listings)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(listings.id, listingId), eq(listings.orgId, orgId)));

  await writeAuditLog({
    orgId,
    userId,
    action: 'listing.deleted',
    entityType: 'listing',
    entityId: listingId,
  });
}
