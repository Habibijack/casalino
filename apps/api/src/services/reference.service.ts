import { eq, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import {
  referenceChecks,
  applications,
  listings,
} from '@casalino/db/schema';
import type { ReferenceResponses } from '@casalino/db/schema';
import type {
  CreateReferenceCheckInput,
  SubmitReferenceInput,
} from '@casalino/shared';
import { getDb } from '../lib/db';
import { AppError } from '../lib/errors';
import { writeAuditLog } from '../lib/query-helpers';
import { emailQueue } from '../lib/queues';
import { notifyAllOrgMembers } from './notification-triggers';

// ---------------------
// Create reference check
// ---------------------

export async function createReferenceCheck(
  orgId: string,
  userId: string,
  input: CreateReferenceCheckInput,
) {
  const db = getDb();

  // Verify application exists and belongs to this org
  const [app] = await db
    .select({
      id: applications.id,
      applicantName: applications.applicantName,
      listingId: applications.listingId,
    })
    .from(applications)
    .innerJoin(listings, eq(applications.listingId, listings.id))
    .where(
      and(
        eq(applications.id, input.applicationId),
        eq(listings.orgId, orgId),
      ),
    )
    .limit(1);

  if (!app) {
    throw AppError.notFound('Bewerbung');
  }

  // Check if a reference check already exists
  const [existing] = await db
    .select({ id: referenceChecks.id })
    .from(referenceChecks)
    .where(eq(referenceChecks.applicationId, input.applicationId))
    .limit(1);

  if (existing) {
    throw AppError.conflict(
      'Fuer diese Bewerbung existiert bereits eine Referenzanfrage',
    );
  }

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [refCheck] = await db
    .insert(referenceChecks)
    .values({
      applicationId: input.applicationId,
      landlordName: input.landlordName,
      landlordEmail: input.landlordEmail,
      status: 'sent',
      token,
      sentAt: new Date(),
      expiresAt,
    })
    .returning();

  // Queue reference request email
  await emailQueue.add('reference-request', {
    type: 'reference-request',
    to: input.landlordEmail,
    landlordName: input.landlordName,
    applicantName: app.applicantName,
    token,
  });

  await writeAuditLog({
    orgId,
    userId,
    action: 'reference_check.created',
    entityType: 'reference_check',
    entityId: refCheck!.id,
    details: {
      applicationId: input.applicationId,
      landlordEmail: input.landlordEmail,
    },
  });

  return refCheck!;
}

// ---------------------
// Get by application ID (protected)
// ---------------------

export async function getByApplicationId(
  orgId: string,
  applicationId: string,
) {
  const db = getDb();

  // Verify org owns the listing via application
  const [app] = await db
    .select({ id: applications.id })
    .from(applications)
    .innerJoin(listings, eq(applications.listingId, listings.id))
    .where(
      and(
        eq(applications.id, applicationId),
        eq(listings.orgId, orgId),
      ),
    )
    .limit(1);

  if (!app) {
    throw AppError.notFound('Bewerbung');
  }

  const [refCheck] = await db
    .select({
      id: referenceChecks.id,
      applicationId: referenceChecks.applicationId,
      landlordName: referenceChecks.landlordName,
      landlordEmail: referenceChecks.landlordEmail,
      status: referenceChecks.status,
      responses: referenceChecks.responses,
      scoreImpact: referenceChecks.scoreImpact,
      sentAt: referenceChecks.sentAt,
      completedAt: referenceChecks.completedAt,
      expiresAt: referenceChecks.expiresAt,
      remindedAt: referenceChecks.remindedAt,
      createdAt: referenceChecks.createdAt,
    })
    .from(referenceChecks)
    .where(eq(referenceChecks.applicationId, applicationId))
    .limit(1);

  return refCheck ?? null;
}

// ---------------------
// Get by token (public)
// ---------------------

export async function getByToken(token: string) {
  const db = getDb();

  const [refCheck] = await db
    .select({
      id: referenceChecks.id,
      landlordName: referenceChecks.landlordName,
      status: referenceChecks.status,
      expiresAt: referenceChecks.expiresAt,
      completedAt: referenceChecks.completedAt,
      applicantName: applications.applicantName,
    })
    .from(referenceChecks)
    .innerJoin(
      applications,
      eq(referenceChecks.applicationId, applications.id),
    )
    .where(eq(referenceChecks.token, token))
    .limit(1);

  if (!refCheck) {
    throw AppError.notFound('Referenzanfrage');
  }

  if (
    refCheck.expiresAt &&
    new Date() > new Date(refCheck.expiresAt)
  ) {
    throw AppError.validation(
      'Link ist abgelaufen. Bitte kontaktieren Sie die Verwaltung.',
    );
  }

  return refCheck;
}

// ---------------------
// Submit reference (public)
// ---------------------

export async function submitReference(
  token: string,
  responses: SubmitReferenceInput,
) {
  const db = getDb();

  const [refCheck] = await db
    .select({
      id: referenceChecks.id,
      status: referenceChecks.status,
      expiresAt: referenceChecks.expiresAt,
      applicationId: referenceChecks.applicationId,
    })
    .from(referenceChecks)
    .where(eq(referenceChecks.token, token))
    .limit(1);

  if (!refCheck) {
    throw AppError.notFound('Referenzanfrage');
  }

  if (refCheck.status === 'completed') {
    throw AppError.validation('Referenz wurde bereits abgegeben');
  }

  if (
    refCheck.expiresAt &&
    new Date() > new Date(refCheck.expiresAt)
  ) {
    throw AppError.validation(
      'Link ist abgelaufen. Bitte kontaktieren Sie die Verwaltung.',
    );
  }

  const scoreImpact = calculateScoreImpact(responses);

  const [updated] = await db
    .update(referenceChecks)
    .set({
      responses,
      scoreImpact,
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(referenceChecks.id, refCheck.id))
    .returning();

  // Update the application's total score with the impact
  const [app] = await db
    .select({
      id: applications.id,
      scoreTotal: applications.scoreTotal,
    })
    .from(applications)
    .where(eq(applications.id, refCheck.applicationId))
    .limit(1);

  if (app?.scoreTotal !== null && app?.scoreTotal !== undefined) {
    const newScore = Math.max(
      0,
      Math.min(100, app.scoreTotal + scoreImpact),
    );
    await db
      .update(applications)
      .set({ scoreTotal: newScore, updatedAt: new Date() })
      .where(eq(applications.id, refCheck.applicationId));
  }

  // Notify org members about the completed reference
  const [appDetail] = await db
    .select({
      applicantName: applications.applicantName,
      listingId: applications.listingId,
    })
    .from(applications)
    .where(eq(applications.id, refCheck.applicationId))
    .limit(1);

  if (appDetail) {
    const [listing] = await db
      .select({ orgId: listings.orgId })
      .from(listings)
      .where(eq(listings.id, appDetail.listingId))
      .limit(1);

    if (listing) {
      await notifyAllOrgMembers({
        orgId: listing.orgId,
        type: 'reference_completed',
        title: 'Referenz eingegangen',
        message: `Referenz fuer ${appDetail.applicantName} wurde abgegeben`,
        entityType: 'application',
        entityId: refCheck.applicationId,
      });
    }
  }

  return updated!;
}

// ---------------------
// Send reminder
// ---------------------

export async function sendReminder(
  orgId: string,
  userId: string,
  referenceCheckId: string,
) {
  const db = getDb();

  const [refCheck] = await db
    .select({
      id: referenceChecks.id,
      status: referenceChecks.status,
      remindedAt: referenceChecks.remindedAt,
      token: referenceChecks.token,
      landlordName: referenceChecks.landlordName,
      landlordEmail: referenceChecks.landlordEmail,
      applicationId: referenceChecks.applicationId,
    })
    .from(referenceChecks)
    .where(eq(referenceChecks.id, referenceCheckId))
    .limit(1);

  if (!refCheck) {
    throw AppError.notFound('Referenzanfrage');
  }

  if (refCheck.status !== 'sent') {
    throw AppError.validation(
      'Erinnerung kann nur fuer ausstehende Referenzen gesendet werden',
    );
  }

  if (refCheck.remindedAt) {
    throw AppError.validation(
      'Erinnerung wurde bereits gesendet',
    );
  }

  // Get applicant name for the email
  const [app] = await db
    .select({ applicantName: applications.applicantName })
    .from(applications)
    .where(eq(applications.id, refCheck.applicationId))
    .limit(1);

  await emailQueue.add('reference-request', {
    type: 'reference-request',
    to: refCheck.landlordEmail,
    landlordName: refCheck.landlordName,
    applicantName: app?.applicantName ?? 'Bewerber/in',
    token: refCheck.token,
  });

  const [updated] = await db
    .update(referenceChecks)
    .set({ remindedAt: new Date(), updatedAt: new Date() })
    .where(eq(referenceChecks.id, referenceCheckId))
    .returning();

  await writeAuditLog({
    orgId,
    userId,
    action: 'reference_check.reminded',
    entityType: 'reference_check',
    entityId: referenceCheckId,
  });

  return updated!;
}

// ---------------------
// Calculate score impact
// ---------------------

export function calculateScoreImpact(
  responses: SubmitReferenceInput,
): number {
  const ratings = [
    responses.paymentPunctuality,
    responses.propertyCondition,
    responses.neighborBehavior,
    responses.houseRulesCompliance,
  ];

  const sum = ratings.reduce((acc, val) => acc + val, 0);
  const avg = sum / ratings.length;

  let impact = 0;

  if (ratings.every((r) => r === 5)) {
    impact = 5;
  } else if (avg >= 4) {
    impact = 3;
  } else if (avg >= 3) {
    impact = 1;
  } else {
    impact = -3;
  }

  if (!responses.wouldRentAgain) {
    impact -= 5;
  }

  return impact;
}
