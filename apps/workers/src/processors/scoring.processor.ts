import type { Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { applications, listings, documents } from '@casalino/db/schema';
import { calculateScore } from '@casalino/shared';
import { getDb } from '../lib/db';
import { emailQueue, creditCheckQueue } from '../lib/queues';
import { generateApplicantSummary } from '../lib/ai';

export interface ScoringJobData {
  applicationId: string;
}

export async function processScoringJob(job: Job<ScoringJobData>) {
  const { applicationId } = job.data;
  const db = getDb();

  // Fetch application with listing
  const [row] = await db
    .select()
    .from(applications)
    .innerJoin(listings, eq(applications.listingId, listings.id))
    .where(eq(applications.id, applicationId))
    .limit(1);

  if (!row) {
    console.warn(`[scoring] Application ${applicationId} not found, skipping`);
    return;
  }

  const app = row.applications;
  const listing = row.listings;

  // Fetch documents
  const docs = await db
    .select({ type: documents.type })
    .from(documents)
    .where(eq(documents.applicationId, applicationId));

  const documentTypes = docs.map((d) => d.type);

  // Parse listing criteria safely
  const criteria = parseCriteria(listing.criteria);

  // Calculate score using shared pure functions
  const scoreBreakdown = calculateScore({
    financial: {
      incomeChf: app.incomeChf,
      listingPriceChf: listing.priceChf,
    },
    dossier: {
      documentTypes,
    },
    matching: {
      householdSize: app.householdSize,
      hasPets: app.hasPets,
      hasSwissResidence: app.hasSwissResidence,
      listingCriteria: {
        maxHouseholdSize: criteria.maxHouseholdSize,
        petsAllowed: criteria.petsAllowed,
      },
    },
    communication: {
      hasCoverLetter: Boolean(app.coverLetter),
      coverLetterLength: app.coverLetter?.length ?? 0,
      hasEmail: Boolean(app.applicantEmail),
      hasPhone: Boolean(app.applicantPhone),
    },
  });

  // Generate AI summary
  const aiSummary = await generateApplicantSummary({
    applicantName: app.applicantName,
    listingAddress: listing.address,
    listingCity: listing.city,
    rooms: Number(listing.rooms),
    priceChf: listing.priceChf,
    incomeChf: app.incomeChf,
    scoreBreakdown,
    documentTypes,
  });

  // Update application with scores and AI summary
  await db
    .update(applications)
    .set({
      scoreTotal: scoreBreakdown.total,
      scoreFinancial: scoreBreakdown.financial,
      scoreDossier: scoreBreakdown.dossier,
      scoreMatching: scoreBreakdown.matching,
      scoreCommunication: scoreBreakdown.communication,
      scoreCredit: scoreBreakdown.credit,
      aiSummary,
      scoredAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(applications.id, applicationId));

  console.log(
    `[scoring] Application ${applicationId} scored: ${scoreBreakdown.total}/100`,
  );

  // Enqueue credit check (runs in parallel, updates score independently)
  await creditCheckQueue.add('credit-check', {
    applicationId,
    applicantName: app.applicantName,
  });

  // Enqueue notification email to property manager
  await emailQueue.add('application-scored', {
    type: 'application-received',
    applicationId,
    applicantName: app.applicantName,
    applicantEmail: app.applicantEmail,
    listingAddress: listing.address,
    listingCity: listing.city,
    orgId: listing.orgId,
  });
}

// ---------------------
// Helpers
// ---------------------

interface ParsedCriteria {
  maxHouseholdSize?: number;
  petsAllowed?: boolean;
}

function parseCriteria(raw: unknown): ParsedCriteria {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const result: ParsedCriteria = {};
  const obj = raw as Record<string, unknown>;

  if (typeof obj['maxHouseholdSize'] === 'number') {
    result.maxHouseholdSize = obj['maxHouseholdSize'];
  }
  if (typeof obj['petsAllowed'] === 'boolean') {
    result.petsAllowed = obj['petsAllowed'];
  }

  return result;
}
