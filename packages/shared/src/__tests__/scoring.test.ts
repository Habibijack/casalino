import { describe, it, expect } from 'vitest';
import {
  scoreFinancial,
  scoreDossier,
  scoreMatching,
  scoreCommunication,
  calculateScore,
} from '../scoring';

describe('scoreFinancial', () => {
  it('returns risk points for null income', () => {
    expect(scoreFinancial({ incomeChf: null, listingPriceChf: 2000 })).toBe(10);
  });

  it('returns risk points for zero income', () => {
    expect(scoreFinancial({ incomeChf: 0, listingPriceChf: 2000 })).toBe(10);
  });

  it('returns risk points for zero listing price', () => {
    expect(scoreFinancial({ incomeChf: 8000, listingPriceChf: 0 })).toBe(10);
  });

  it('returns excellent (35) for ratio >= 3.5', () => {
    // 7000 / 2000 = 3.5
    expect(scoreFinancial({ incomeChf: 7000, listingPriceChf: 2000 })).toBe(35);
  });

  it('returns good (28) for ratio >= 3.0 and < 3.5', () => {
    // 6000 / 2000 = 3.0
    expect(scoreFinancial({ incomeChf: 6000, listingPriceChf: 2000 })).toBe(28);
  });

  it('returns acceptable (20) for ratio >= 2.5 and < 3.0', () => {
    // 5000 / 2000 = 2.5
    expect(scoreFinancial({ incomeChf: 5000, listingPriceChf: 2000 })).toBe(20);
  });

  it('returns risk (10) for ratio < 2.5', () => {
    // 4000 / 2000 = 2.0
    expect(scoreFinancial({ incomeChf: 4000, listingPriceChf: 2000 })).toBe(10);
  });
});

describe('scoreDossier', () => {
  it('returns 0 for empty documents', () => {
    expect(scoreDossier({ documentTypes: [] })).toBe(0);
  });

  it('sums points for known document types', () => {
    // betreibungsauszug=8, lohnausweis=7 => 15
    expect(scoreDossier({ documentTypes: ['betreibungsauszug', 'lohnausweis'] })).toBe(15);
  });

  it('returns full 25 for all document types', () => {
    const allDocs = [
      'betreibungsauszug', // 8
      'lohnausweis',       // 7
      'ausweis',           // 5
      'arbeitsvertrag',    // 3
      'vermieter_referenz', // 2
    ];
    // Total = 25, capped at 25
    expect(scoreDossier({ documentTypes: allDocs })).toBe(25);
  });

  it('ignores unknown document types', () => {
    expect(scoreDossier({ documentTypes: ['unknown_doc', 'ausweis'] })).toBe(5);
  });

  it('caps at max 25', () => {
    // Even if we somehow pass duplicates that exceed 25
    const docs = [
      'betreibungsauszug', // 8
      'lohnausweis',       // 7
      'ausweis',           // 5
      'arbeitsvertrag',    // 3
      'vermieter_referenz', // 2
      'betreibungsauszug', // 8 (duplicate)
    ];
    // 8+7+5+3+2+8 = 33, capped at 25
    expect(scoreDossier({ documentTypes: docs })).toBe(25);
  });
});

describe('scoreMatching', () => {
  it('returns max 20 for perfect match', () => {
    expect(scoreMatching({
      householdSize: 2,
      hasPets: false,
      hasSwissResidence: true,
      listingCriteria: { maxHouseholdSize: 4, petsAllowed: true },
    })).toBe(20);
  });

  it('deducts 5 for no Swiss residence', () => {
    expect(scoreMatching({
      householdSize: 2,
      hasPets: false,
      hasSwissResidence: false,
      listingCriteria: { maxHouseholdSize: 4 },
    })).toBe(15);
  });

  it('deducts 8 for household too large', () => {
    expect(scoreMatching({
      householdSize: 5,
      hasPets: false,
      hasSwissResidence: true,
      listingCriteria: { maxHouseholdSize: 3 },
    })).toBe(12);
  });

  it('deducts 7 for pets when not allowed', () => {
    expect(scoreMatching({
      householdSize: 2,
      hasPets: true,
      hasSwissResidence: true,
      listingCriteria: { petsAllowed: false },
    })).toBe(13);
  });

  it('applies all penalties and clamps to 0', () => {
    expect(scoreMatching({
      householdSize: 10,
      hasPets: true,
      hasSwissResidence: false,
      listingCriteria: { maxHouseholdSize: 2, petsAllowed: false },
    })).toBe(0);
  });

  it('does not penalize household when no criteria set', () => {
    expect(scoreMatching({
      householdSize: 10,
      hasPets: false,
      hasSwissResidence: true,
      listingCriteria: {},
    })).toBe(20);
  });

  it('does not penalize when householdSize is null', () => {
    expect(scoreMatching({
      householdSize: null,
      hasPets: false,
      hasSwissResidence: true,
      listingCriteria: { maxHouseholdSize: 3 },
    })).toBe(20);
  });
});

describe('scoreCommunication', () => {
  it('returns 0 for no cover letter and no contact info', () => {
    expect(scoreCommunication({
      hasCoverLetter: false,
      coverLetterLength: 0,
      hasEmail: false,
      hasPhone: false,
    })).toBe(0);
  });

  it('gives 1 for very short cover letter', () => {
    expect(scoreCommunication({
      hasCoverLetter: true,
      coverLetterLength: 10,
      hasEmail: false,
      hasPhone: false,
    })).toBe(1);
  });

  it('gives 3 for medium cover letter (>= 50 chars)', () => {
    expect(scoreCommunication({
      hasCoverLetter: true,
      coverLetterLength: 100,
      hasEmail: false,
      hasPhone: false,
    })).toBe(3);
  });

  it('gives 5 for long cover letter (>= 200 chars)', () => {
    expect(scoreCommunication({
      hasCoverLetter: true,
      coverLetterLength: 200,
      hasEmail: false,
      hasPhone: false,
    })).toBe(5);
  });

  it('gives 3 for email and 2 for phone', () => {
    expect(scoreCommunication({
      hasCoverLetter: false,
      coverLetterLength: 0,
      hasEmail: true,
      hasPhone: true,
    })).toBe(5);
  });

  it('caps at max 10', () => {
    expect(scoreCommunication({
      hasCoverLetter: true,
      coverLetterLength: 500,
      hasEmail: true,
      hasPhone: true,
    })).toBe(10);
  });
});

describe('calculateScore', () => {
  it('aggregates all sub-scores', () => {
    const result = calculateScore({
      financial: { incomeChf: 7000, listingPriceChf: 2000 },
      dossier: { documentTypes: ['betreibungsauszug', 'lohnausweis'] },
      matching: {
        householdSize: 2,
        hasPets: false,
        hasSwissResidence: true,
        listingCriteria: {},
      },
      communication: {
        hasCoverLetter: true,
        coverLetterLength: 300,
        hasEmail: true,
        hasPhone: true,
      },
    });

    expect(result.financial).toBe(35);
    expect(result.dossier).toBe(15);
    expect(result.matching).toBe(20);
    expect(result.communication).toBe(10);
    expect(result.credit).toBe(0);
    expect(result.total).toBe(80);
  });

  it('includes credit score when provided', () => {
    const result = calculateScore({
      financial: { incomeChf: 7000, listingPriceChf: 2000 },
      dossier: { documentTypes: [] },
      matching: {
        householdSize: 1,
        hasPets: false,
        hasSwissResidence: true,
        listingCriteria: {},
      },
      communication: {
        hasCoverLetter: false,
        coverLetterLength: 0,
        hasEmail: false,
        hasPhone: false,
      },
      creditScore: 8,
    });

    expect(result.credit).toBe(8);
    expect(result.total).toBe(35 + 0 + 20 + 0 + 8);
  });

  it('defaults credit to 0 when not provided', () => {
    const result = calculateScore({
      financial: { incomeChf: null, listingPriceChf: 2000 },
      dossier: { documentTypes: [] },
      matching: {
        householdSize: null,
        hasPets: false,
        hasSwissResidence: false,
        listingCriteria: {},
      },
      communication: {
        hasCoverLetter: false,
        coverLetterLength: 0,
        hasEmail: false,
        hasPhone: false,
      },
    });

    expect(result.credit).toBe(0);
    expect(result.total).toBe(10 + 0 + 15 + 0 + 0);
  });
});
