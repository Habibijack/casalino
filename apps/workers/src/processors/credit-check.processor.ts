import type { Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { applications, creditChecks } from '@casalino/db/schema';
import { getDb } from '../lib/db';

export interface CreditCheckJobData {
  applicationId: string;
  applicantName: string;
}

interface TilbagoResult {
  reference: string;
  hasEntries: boolean;
  entryCount: number;
  summary: string;
}

/**
 * tilbago credit check processor.
 * Uses real tilbago API when TILBAGO_API_URL and TILBAGO_API_KEY are set.
 * Falls back to mock otherwise.
 */
export async function processCreditCheckJob(
  job: Job<CreditCheckJobData>,
) {
  const { applicationId, applicantName } = job.data;
  const db = getDb();

  // Create credit check record
  const [check] = await db
    .insert(creditChecks)
    .values({
      applicationId,
      status: 'processing',
      tilbagoReference: `pending-${Date.now()}`,
    })
    .returning();

  if (!check) {
    console.error(`[credit-check] Failed to create record for ${applicationId}`);
    return;
  }

  let result: TilbagoResult;

  const tilbagoUrl = process.env.TILBAGO_API_URL;
  const tilbagoKey = process.env.TILBAGO_API_KEY;

  if (tilbagoUrl && tilbagoKey) {
    result = await callTilbagoApi(tilbagoUrl, tilbagoKey, applicantName);
  } else {
    result = await mockCreditCheck(applicantName);
  }

  const scoreImpact = result.hasEntries ? -(result.entryCount * 3) : 10;

  // Update credit check record
  await db
    .update(creditChecks)
    .set({
      status: 'completed',
      tilbagoReference: result.reference,
      hasEntries: result.hasEntries,
      entryCount: result.entryCount,
      scoreImpact,
      resultSummary: result.summary,
      checkedAt: new Date(),
    })
    .where(eq(creditChecks.id, check.id));

  // Update application credit score
  await db
    .update(applications)
    .set({
      scoreCredit: Math.max(0, scoreImpact),
      updatedAt: new Date(),
    })
    .where(eq(applications.id, applicationId));

  // Recalculate total score
  const [app] = await db
    .select({
      scoreFinancial: applications.scoreFinancial,
      scoreDossier: applications.scoreDossier,
      scoreMatching: applications.scoreMatching,
      scoreCommunication: applications.scoreCommunication,
      scoreCredit: applications.scoreCredit,
    })
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);

  if (app) {
    const total =
      (app.scoreFinancial ?? 0) +
      (app.scoreDossier ?? 0) +
      (app.scoreMatching ?? 0) +
      (app.scoreCommunication ?? 0) +
      (app.scoreCredit ?? 0);

    await db
      .update(applications)
      .set({ scoreTotal: total, updatedAt: new Date() })
      .where(eq(applications.id, applicationId));
  }

  console.log(
    `[credit-check] ${applicantName}: ${result.summary} (impact: ${scoreImpact})`,
  );
}

// ---------------------
// Real tilbago API call
// ---------------------

async function callTilbagoApi(
  baseUrl: string,
  apiKey: string,
  applicantName: string,
): Promise<TilbagoResult> {
  try {
    const res = await fetch(`${baseUrl}/api/v1/credrep`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ name: applicantName }),
    });

    if (!res.ok) {
      console.error(`[credit-check] tilbago API error: ${res.status}`);
      return mockCreditCheck(applicantName);
    }

    const data = await res.json();
    const hasEntries = Boolean(data.has_entries);
    const entryCount = typeof data.entry_count === 'number' ? data.entry_count : 0;

    return {
      reference: String(data.reference ?? `tilbago-${Date.now()}`),
      hasEntries,
      entryCount,
      summary: hasEntries
        ? `${entryCount} Eintr${entryCount === 1 ? 'ag' : 'aege'} gefunden`
        : 'Keine Eintraege',
    };
  } catch (err) {
    console.error('[credit-check] tilbago API failed, using mock:', err);
    return mockCreditCheck(applicantName);
  }
}

// ---------------------
// Mock implementation
// ---------------------

async function mockCreditCheck(
  _applicantName: string,
): Promise<TilbagoResult> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 90% clean, 10% have entries
  const hasEntries = Math.random() < 0.1;
  const entryCount = hasEntries ? Math.floor(Math.random() * 3) + 1 : 0;

  return {
    reference: `mock-${Date.now()}`,
    hasEntries,
    entryCount,
    summary: hasEntries
      ? `${entryCount} Eintr${entryCount === 1 ? 'ag' : 'aege'} gefunden`
      : 'Keine Eintraege',
  };
}
