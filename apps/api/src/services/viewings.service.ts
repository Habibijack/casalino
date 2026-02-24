import { eq, and, isNull, desc, gte } from 'drizzle-orm';
import { viewings, listings, applications } from '@casalino/db/schema';
import type { CreateViewingInput, UpdateViewingStatusInput } from '@casalino/shared';
import { getDb } from '../lib/db';
import { AppError } from '../lib/errors';
import {
  buildCursorCondition,
  buildCursorResult,
  countRows,
  requireRole,
  writeAuditLog,
} from '../lib/query-helpers';
import { emailQueue, reminderQueue } from '../lib/queues';

// ---------------------
// List viewings for an org
// ---------------------

interface ListViewingsOpts {
  orgId: string;
  listingId?: string;
  status?: string;
  upcoming?: boolean;
  cursor?: string;
  limit: number;
  direction: 'forward' | 'backward';
}

export async function listViewings(opts: ListViewingsOpts) {
  const db = getDb();
  const { orgId, listingId, status, upcoming, cursor, limit, direction } = opts;

  const conditions = [
    eq(listings.orgId, orgId),
  ];

  if (listingId) {
    conditions.push(eq(viewings.listingId, listingId));
  }
  if (status) {
    conditions.push(eq(viewings.status, status));
  }
  if (upcoming) {
    conditions.push(gte(viewings.slotStart, new Date()));
  }

  const cursorCondition = buildCursorCondition({
    cursor,
    direction,
    idColumn: viewings.id,
  });
  if (cursorCondition) {
    conditions.push(cursorCondition);
  }

  const whereClause = and(...conditions);

  const [rows, totalCount] = await Promise.all([
    db
      .select({
        id: viewings.id,
        listingId: viewings.listingId,
        applicationId: viewings.applicationId,
        slotStart: viewings.slotStart,
        slotEnd: viewings.slotEnd,
        status: viewings.status,
        feedbackPositive: viewings.feedbackPositive,
        feedbackNote: viewings.feedbackNote,
        reminderSent: viewings.reminderSent,
        createdAt: viewings.createdAt,
        // Joined
        listingAddress: listings.address,
        listingCity: listings.city,
        applicantName: applications.applicantName,
        applicantEmail: applications.applicantEmail,
      })
      .from(viewings)
      .innerJoin(listings, eq(viewings.listingId, listings.id))
      .innerJoin(applications, eq(viewings.applicationId, applications.id))
      .where(whereClause)
      .orderBy(desc(viewings.slotStart))
      .limit(limit + 1),
    countRows(viewings),
  ]);

  return buildCursorResult(rows, limit, totalCount);
}

// ---------------------
// Get by ID
// ---------------------

export async function getViewingById(orgId: string, viewingId: string) {
  const db = getDb();

  const [row] = await db
    .select({
      id: viewings.id,
      listingId: viewings.listingId,
      applicationId: viewings.applicationId,
      slotStart: viewings.slotStart,
      slotEnd: viewings.slotEnd,
      status: viewings.status,
      feedbackPositive: viewings.feedbackPositive,
      feedbackNote: viewings.feedbackNote,
      reminderSent: viewings.reminderSent,
      createdAt: viewings.createdAt,
      updatedAt: viewings.updatedAt,
      listingAddress: listings.address,
      listingCity: listings.city,
      applicantName: applications.applicantName,
      applicantEmail: applications.applicantEmail,
      applicantPhone: applications.applicantPhone,
    })
    .from(viewings)
    .innerJoin(listings, eq(viewings.listingId, listings.id))
    .innerJoin(applications, eq(viewings.applicationId, applications.id))
    .where(and(eq(viewings.id, viewingId), eq(listings.orgId, orgId)))
    .limit(1);

  if (!row) {
    throw AppError.notFound('Besichtigung');
  }

  return row;
}

// ---------------------
// Create viewing
// ---------------------

export async function createViewing(
  orgId: string,
  userId: string,
  input: CreateViewingInput,
) {
  const db = getDb();

  // Verify listing belongs to org
  const [listing] = await db
    .select({ id: listings.id, address: listings.address, city: listings.city })
    .from(listings)
    .where(and(eq(listings.id, input.listingId), eq(listings.orgId, orgId)))
    .limit(1);

  if (!listing) {
    throw AppError.notFound('Inserat');
  }

  // Verify application exists for this listing
  const [app] = await db
    .select({
      id: applications.id,
      applicantName: applications.applicantName,
      applicantEmail: applications.applicantEmail,
      applicantLanguage: applications.applicantLanguage,
    })
    .from(applications)
    .where(
      and(
        eq(applications.id, input.applicationId),
        eq(applications.listingId, input.listingId),
        isNull(applications.deletedAt),
      ),
    )
    .limit(1);

  if (!app) {
    throw AppError.notFound('Bewerbung');
  }

  const [viewing] = await db
    .insert(viewings)
    .values({
      listingId: input.listingId,
      applicationId: input.applicationId,
      slotStart: new Date(input.slotStart),
      slotEnd: new Date(input.slotEnd),
      status: 'invited',
    })
    .returning();

  await writeAuditLog({
    orgId,
    userId,
    action: 'viewing.created',
    entityType: 'viewing',
    entityId: viewing!.id,
    details: { listingId: input.listingId, applicationId: input.applicationId },
  });

  // Send invitation email to applicant
  const slotStartDate = new Date(input.slotStart);
  const supportedLanguages = ['de', 'fr', 'it'];
  const applicantLanguage = supportedLanguages.includes(app.applicantLanguage)
    ? app.applicantLanguage
    : 'de';

  if (app.applicantEmail) {
    await emailQueue.add('viewing-invitation', {
      type: 'viewing-invitation',
      applicantEmail: app.applicantEmail,
      applicantName: app.applicantName,
      listingAddress: `${listing.address}, ${listing.city}`,
      date: slotStartDate.toLocaleDateString('de-CH'),
      time: slotStartDate.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }),
      viewingId: viewing!.id,
      language: applicantLanguage,
    });
  }

  // Schedule reminder 24 hours before the viewing
  const reminderAt = slotStartDate.getTime() - 24 * 60 * 60 * 1000;
  const delayMs = reminderAt - Date.now();
  if (delayMs > 0) {
    await reminderQueue.add(
      'viewing-reminder',
      { viewingId: viewing!.id },
      { delay: delayMs },
    );
  }

  return viewing!;
}

// ---------------------
// Update viewing status + feedback
// ---------------------

export async function updateViewingStatus(
  orgId: string,
  userId: string,
  viewingId: string,
  input: UpdateViewingStatusInput,
) {
  // Verify ownership
  await getViewingById(orgId, viewingId);

  const db = getDb();

  const updateData: Record<string, unknown> = {
    status: input.status,
    updatedAt: new Date(),
  };

  if (input.feedbackPositive !== undefined) {
    updateData['feedbackPositive'] = input.feedbackPositive;
  }
  if (input.feedbackNote !== undefined) {
    updateData['feedbackNote'] = input.feedbackNote;
  }

  const [updated] = await db
    .update(viewings)
    .set(updateData)
    .where(eq(viewings.id, viewingId))
    .returning();

  await writeAuditLog({
    orgId,
    userId,
    action: 'viewing.status_changed',
    entityType: 'viewing',
    entityId: viewingId,
    details: { status: input.status },
  });

  return updated!;
}

// ---------------------
// Delete viewing
// ---------------------

export async function deleteViewing(
  orgId: string,
  userId: string,
  viewingId: string,
) {
  await getViewingById(orgId, viewingId);

  const db = getDb();

  await db.delete(viewings).where(eq(viewings.id, viewingId));

  await writeAuditLog({
    orgId,
    userId,
    action: 'viewing.deleted',
    entityType: 'viewing',
    entityId: viewingId,
  });
}
