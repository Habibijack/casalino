import { Hono } from 'hono';
import { eq, and, isNull } from 'drizzle-orm';
import type { AppEnv } from '../types';
import {
  createListingSchema,
  updateListingSchema,
  updateListingStatusSchema,
  listingFilterSchema,
} from '@casalino/shared';
import { listings } from '@casalino/db/schema';
import {
  listListings,
  getListingById,
  createListing,
  updateListing,
  updateListingStatus,
  softDeleteListing,
} from '../services/listings.service';
import { generateListingDescriptions, suggestPrice } from '../services/ai.service';
import { AppError } from '../lib/errors';
import { requireRole, writeAuditLog } from '../lib/query-helpers';
import { getDb } from '../lib/db';

export const listingsRouter = new Hono<AppEnv>()

  // ---------------------
  // GET / — List all listings for org
  // ---------------------
  .get('/', async (c) => {
    const orgId = c.get('orgId');
    const raw = Object.fromEntries(new URL(c.req.url).searchParams);

    const parsed = listingFilterSchema.safeParse({
      ...raw,
      limit: raw.limit ? Number(raw.limit) : undefined,
    });
    if (!parsed.success) {
      throw AppError.validation(parsed.error.issues[0]?.message ?? 'Invalid filters');
    }

    const result = await listListings(orgId, parsed.data);
    return c.json({ success: true, data: result });
  })

  // ---------------------
  // GET /:id — Get single listing
  // ---------------------
  .get('/:id', async (c) => {
    const orgId = c.get('orgId');
    const id = c.req.param('id');
    const listing = await getListingById(orgId, id);
    return c.json({ success: true, data: listing });
  })

  // ---------------------
  // POST / — Create listing
  // ---------------------
  .post('/', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const body = await c.req.json();
    const parsed = createListingSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validation(parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const listing = await createListing(orgId, userId, parsed.data);
    return c.json({ success: true, data: listing }, 201);
  })

  // ---------------------
  // PATCH /:id — Update listing fields
  // ---------------------
  .patch('/:id', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateListingSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validation(parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const listing = await updateListing(orgId, userId, id, parsed.data);
    return c.json({ success: true, data: listing });
  })

  // ---------------------
  // PATCH /:id/status — Update listing status
  // ---------------------
  .patch('/:id/status', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateListingStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validation(parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const listing = await updateListingStatus(orgId, userId, id, parsed.data);
    return c.json({ success: true, data: listing });
  })

  // ---------------------
  // POST /:id/generate-text — AI-generate DE/FR/IT descriptions
  // ---------------------
  .post('/:id/generate-text', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const id = c.req.param('id');
    const listing = await getListingById(orgId, id);

    const descriptions = await generateListingDescriptions({
      address: listing.address,
      city: listing.city,
      rooms: Number(listing.rooms),
      areaSqm: listing.areaSqm,
      priceChf: listing.priceChf,
      nkChf: listing.nkChf,
      floor: listing.floor,
      features: listing.features ?? [],
    });

    const db = getDb();

    const [updated] = await db
      .update(listings)
      .set({
        descriptionDe: descriptions.descriptionDe,
        descriptionFr: descriptions.descriptionFr,
        descriptionIt: descriptions.descriptionIt,
        updatedAt: new Date(),
      })
      .where(and(eq(listings.id, id), eq(listings.orgId, orgId)))
      .returning();

    await writeAuditLog({
      orgId,
      userId,
      action: 'listing.ai_text_generated',
      entityType: 'listing',
      entityId: id,
    });

    return c.json({ success: true, data: updated });
  })

  // ---------------------
  // GET /:id/price-suggestion — Suggest price based on market data
  // ---------------------
  .get('/:id/price-suggestion', async (c) => {
    const orgId = c.get('orgId');
    const id = c.req.param('id');
    const listing = await getListingById(orgId, id);

    const suggestion = suggestPrice({
      canton: listing.canton,
      areaSqm: listing.areaSqm,
      rooms: Number(listing.rooms),
    });

    return c.json({ success: true, data: suggestion });
  })

  // ---------------------
  // DELETE /:id — Soft delete listing
  // ---------------------
  .delete('/:id', async (c) => {
    const orgId = c.get('orgId');
    const userId = c.get('userId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin', 'editor');

    const id = c.req.param('id');
    await softDeleteListing(orgId, userId, id);
    return c.json({ success: true, data: { deleted: true } });
  });

// ---------------------
// Public route — get listing info for application form
// ---------------------

export const publicListingsRouter = new Hono()
  .get('/:id', async (c) => {
    const id = c.req.param('id');
    const db = getDb();

    const [listing] = await db
      .select({
        id: listings.id,
        address: listings.address,
        plz: listings.plz,
        city: listings.city,
        canton: listings.canton,
        rooms: listings.rooms,
        priceChf: listings.priceChf,
        nkChf: listings.nkChf,
        status: listings.status,
        descriptionDe: listings.descriptionDe,
      })
      .from(listings)
      .where(and(eq(listings.id, id), isNull(listings.deletedAt)))
      .limit(1);

    if (!listing) {
      throw AppError.notFound('Inserat');
    }

    return c.json({ success: true, data: listing });
  });
