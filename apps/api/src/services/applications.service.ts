import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { applications, listings, documents } from '@casalino/db/schema';
import type {
  CreateApplicationInput,
  UpdateApplicationStatusInput,
} from '@casalino/shared';
import { getDb } from '../lib/db';
import { AppError } from '../lib/errors';
import {
  buildCursorCondition,
  buildCursorResult,
  countRows,
  writeAuditLog,
} from '../lib/query-helpers';
import { scoringQueue, emailQueue } from '../lib/queues';

// ---------------------
// List applications for an org
// ---------------------

interface ListApplicationsOpts {
  orgId: string;
  listingId?: string;
  status?: string;
  cursor?: string;
  limit: number;
  direction: 'forward' | 'backward';
}

export async function listApplications(opts: ListApplicationsOpts) {
  const db = getDb();
  const { orgId, listingId, status, cursor, limit, direction } = opts;

  // Applications are linked to listings, so we need to join
  // to verify the listing belongs to this org
  const conditions = [
    eq(listings.orgId, orgId),
    isNull(applications.deletedAt),
  ];

  if (listingId) {
    conditions.push(eq(applications.listingId, listingId));
  }
  if (status) {
    conditions.push(eq(applications.status, status));
  }

  const cursorCondition = buildCursorCondition({
    cursor,
    direction,
    idColumn: applications.id,
  });
  if (cursorCondition) {
    conditions.push(cursorCondition);
  }

  const whereClause = and(...conditions);

  const [rows, totalCount] = await Promise.all([
    db
      .select({
        id: applications.id,
        listingId: applications.listingId,
        applicantName: applications.applicantName,
        applicantEmail: applications.applicantEmail,
        applicantPhone: applications.applicantPhone,
        applicantLanguage: applications.applicantLanguage,
        householdSize: applications.householdSize,
        incomeChf: applications.incomeChf,
        employmentType: applications.employmentType,
        hasPets: applications.hasPets,
        status: applications.status,
        scoreTotal: applications.scoreTotal,
        aiSummary: applications.aiSummary,
        scoredAt: applications.scoredAt,
        createdAt: applications.createdAt,
        // Listing info for context
        listingAddress: listings.address,
        listingCity: listings.city,
      })
      .from(applications)
      .innerJoin(listings, eq(applications.listingId, listings.id))
      .where(whereClause)
      .orderBy(desc(applications.createdAt))
      .limit(limit + 1),
    countRows(
      applications,
      and(isNull(applications.deletedAt)),
    ),
  ]);

  return buildCursorResult(rows, limit, totalCount);
}

// ---------------------
// Get by ID with full details
// ---------------------

export async function getApplicationById(
  orgId: string,
  applicationId: string,
) {
  const db = getDb();

  const [row] = await db
    .select()
    .from(applications)
    .innerJoin(listings, eq(applications.listingId, listings.id))
    .where(
      and(
        eq(applications.id, applicationId),
        eq(listings.orgId, orgId),
        isNull(applications.deletedAt),
      ),
    )
    .limit(1);

  if (!row) {
    throw AppError.notFound('Bewerbung');
  }

  // Fetch documents for this application
  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.applicationId, applicationId));

  return {
    ...row.applications,
    listing: row.listings,
    documents: docs,
  };
}

// ---------------------
// Create (public — no auth required)
// ---------------------

export async function createApplication(input: CreateApplicationInput) {
  const db = getDb();

  // Verify listing exists and is live
  const [listing] = await db
    .select({ id: listings.id, status: listings.status })
    .from(listings)
    .where(eq(listings.id, input.listingId))
    .limit(1);

  if (!listing) {
    throw AppError.notFound('Inserat');
  }

  if (listing.status !== 'live' && listing.status !== 'viewing') {
    throw AppError.validation('Dieses Inserat nimmt keine Bewerbungen an');
  }

  const [application] = await db
    .insert(applications)
    .values({
      listingId: input.listingId,
      applicantName: input.applicantName,
      applicantEmail: input.applicantEmail ?? null,
      applicantPhone: input.applicantPhone ?? null,
      applicantLanguage: input.applicantLanguage,
      householdSize: input.householdSize ?? null,
      incomeChf: input.incomeChf ?? null,
      employmentType: input.employmentType ?? null,
      hasPets: input.hasPets,
      petType: input.petType ?? null,
      desiredMoveDate: input.desiredMoveDate ?? null,
      coverLetter: input.coverLetter ?? null,
      landlordName: input.landlordName ?? null,
      landlordEmail: input.landlordEmail ?? null,
      hasSwissResidence: input.hasSwissResidence,
      consentAt: input.consent ? new Date() : null,
      status: 'new',
    })
    .returning();

  // Increment application count on listing
  await db
    .update(listings)
    .set({
      applicationCount: sql`${listings.applicationCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(listings.id, input.listingId));

  // Enqueue scoring job (async — does not block the response)
  await scoringQueue.add('score-application', {
    applicationId: application!.id,
  });

  return application!;
}

// ---------------------
// Update Status
// ---------------------

export async function updateApplicationStatus(
  orgId: string,
  userId: string,
  applicationId: string,
  input: UpdateApplicationStatusInput,
) {
  // Verify ownership via listing
  const existing = await getApplicationById(orgId, applicationId);

  const db = getDb();

  const [updated] = await db
    .update(applications)
    .set({
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, applicationId))
    .returning();

  await writeAuditLog({
    orgId,
    userId,
    action: 'application.status_changed',
    entityType: 'application',
    entityId: applicationId,
    details: { from: existing.status, to: input.status },
  });

  // Send rejection email if status changed to rejected
  if (input.status === 'rejected' && existing.applicantEmail) {
    const lang = existing.applicantLanguage;
    const validLang = lang === 'fr' || lang === 'it' ? lang : 'de';

    await emailQueue.add('rejection', {
      type: 'rejection',
      applicantEmail: existing.applicantEmail,
      applicantName: existing.applicantName,
      listingAddress: `${existing.listing.address}, ${existing.listing.city}`,
      language: validLang,
    });
  }

  return updated!;
}
