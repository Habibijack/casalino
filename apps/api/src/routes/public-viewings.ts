import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { viewings, listings, applications } from '@casalino/db/schema';
import { getDb } from '../lib/db';
import { AppError } from '../lib/errors';

// ---------------------
// Public routes (no auth required)
// ---------------------

export const publicViewingsRouter = new Hono()

  // GET /api/v1/public/viewings/:id
  // Returns viewing details + listing address + applicant name
  .get('/:id', async (c) => {
    const id = c.req.param('id');
    const db = getDb();

    const [row] = await db
      .select({
        id: viewings.id,
        status: viewings.status,
        slotStart: viewings.slotStart,
        slotEnd: viewings.slotEnd,
        listingAddress: listings.address,
        listingCity: listings.city,
        listingPlz: listings.plz,
        applicantName: applications.applicantName,
      })
      .from(viewings)
      .innerJoin(listings, eq(viewings.listingId, listings.id))
      .innerJoin(applications, eq(viewings.applicationId, applications.id))
      .where(eq(viewings.id, id))
      .limit(1);

    if (!row) {
      throw AppError.notFound('Besichtigung');
    }

    return c.json({ success: true, data: row });
  })

  // POST /api/v1/public/viewings/:id/confirm
  // Sets status to 'confirmed' — no auth required
  .post('/:id/confirm', async (c) => {
    const id = c.req.param('id');
    const db = getDb();

    const [existing] = await db
      .select({ id: viewings.id, status: viewings.status })
      .from(viewings)
      .where(eq(viewings.id, id))
      .limit(1);

    if (!existing) {
      throw AppError.notFound('Besichtigung');
    }

    if (existing.status === 'cancelled') {
      throw AppError.conflict('Diese Besichtigung wurde abgesagt.');
    }

    if (existing.status === 'confirmed') {
      return c.json({ success: true, data: { alreadyConfirmed: true } });
    }

    const [updated] = await db
      .update(viewings)
      .set({ status: 'confirmed', updatedAt: new Date() })
      .where(and(eq(viewings.id, id)))
      .returning({ id: viewings.id, status: viewings.status });

    return c.json({ success: true, data: { alreadyConfirmed: false, status: updated!.status } });
  });
