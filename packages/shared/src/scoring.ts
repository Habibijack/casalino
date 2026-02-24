import {
  DEFAULT_SCORING_WEIGHTS,
  FINANCIAL_THRESHOLDS,
  DOSSIER_POINTS,
} from './constants';
import type { ScoreBreakdown } from './types';

// ---------------------
// Financial Score (max 35)
// Evaluates income-to-rent ratio
// ---------------------

interface FinancialInput {
  incomeChf: number | null;
  listingPriceChf: number;
}

export function scoreFinancial(input: FinancialInput): number {
  const { incomeChf, listingPriceChf } = input;

  if (!incomeChf || incomeChf <= 0 || listingPriceChf <= 0) {
    return FINANCIAL_THRESHOLDS.risk.points;
  }

  const ratio = incomeChf / listingPriceChf;

  if (ratio >= FINANCIAL_THRESHOLDS.excellent.ratio) {
    return FINANCIAL_THRESHOLDS.excellent.points;
  }
  if (ratio >= FINANCIAL_THRESHOLDS.good.ratio) {
    return FINANCIAL_THRESHOLDS.good.points;
  }
  if (ratio >= FINANCIAL_THRESHOLDS.acceptable.ratio) {
    return FINANCIAL_THRESHOLDS.acceptable.points;
  }
  return FINANCIAL_THRESHOLDS.risk.points;
}

// ---------------------
// Dossier Score (max 25)
// Points per document type submitted
// ---------------------

interface DossierInput {
  documentTypes: string[];
}

export function scoreDossier(input: DossierInput): number {
  const { documentTypes } = input;
  let total = 0;

  for (const docType of documentTypes) {
    const points = DOSSIER_POINTS[docType as keyof typeof DOSSIER_POINTS];
    if (points) {
      total += points;
    }
  }

  return Math.min(total, DEFAULT_SCORING_WEIGHTS.dossier);
}

// ---------------------
// Matching Score (max 20)
// How well the applicant matches listing criteria
// ---------------------

interface MatchingInput {
  householdSize: number | null;
  hasPets: boolean;
  hasSwissResidence: boolean;
  listingCriteria: {
    maxHouseholdSize?: number;
    petsAllowed?: boolean;
  };
}

export function scoreMatching(input: MatchingInput): number {
  const { householdSize, hasPets, hasSwissResidence, listingCriteria } = input;
  let score = DEFAULT_SCORING_WEIGHTS.matching;

  // Swiss residence is preferred
  if (!hasSwissResidence) {
    score -= 5;
  }

  // Household size check
  if (
    listingCriteria.maxHouseholdSize &&
    householdSize &&
    householdSize > listingCriteria.maxHouseholdSize
  ) {
    score -= 8;
  }

  // Pets check
  if (hasPets && listingCriteria.petsAllowed === false) {
    score -= 7;
  }

  return Math.max(0, score);
}

// ---------------------
// Communication Score (max 10)
// Quality of the application itself
// ---------------------

interface CommunicationInput {
  hasCoverLetter: boolean;
  coverLetterLength: number;
  hasEmail: boolean;
  hasPhone: boolean;
}

export function scoreCommunication(input: CommunicationInput): number {
  let score = 0;

  // Cover letter: up to 5 points
  if (input.hasCoverLetter) {
    if (input.coverLetterLength >= 200) {
      score += 5;
    } else if (input.coverLetterLength >= 50) {
      score += 3;
    } else {
      score += 1;
    }
  }

  // Contact info: up to 5 points
  if (input.hasEmail) score += 3;
  if (input.hasPhone) score += 2;

  return Math.min(score, DEFAULT_SCORING_WEIGHTS.communication);
}

// ---------------------
// Calculate total score
// Credit score starts at 0, updated when credit check completes
// ---------------------

interface ScoreAllInput {
  financial: FinancialInput;
  dossier: DossierInput;
  matching: MatchingInput;
  communication: CommunicationInput;
  creditScore?: number;
}

export function calculateScore(input: ScoreAllInput): ScoreBreakdown {
  const financial = scoreFinancial(input.financial);
  const dossier = scoreDossier(input.dossier);
  const matching = scoreMatching(input.matching);
  const communication = scoreCommunication(input.communication);
  const credit = input.creditScore ?? 0;

  return {
    financial,
    dossier,
    matching,
    communication,
    credit,
    total: financial + dossier + matching + communication + credit,
  };
}
