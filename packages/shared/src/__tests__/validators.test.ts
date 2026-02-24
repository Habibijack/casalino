import { describe, it, expect } from 'vitest';
import {
  paginationSchema,
  createListingSchema,
  createApplicationSchema,
  inviteMemberSchema,
  updateListingStatusSchema,
} from '../validators';

describe('paginationSchema', () => {
  it('applies defaults when no input given', () => {
    const result = paginationSchema.parse({});
    expect(result.limit).toBe(20);
    expect(result.direction).toBe('forward');
    expect(result.cursor).toBeUndefined();
  });

  it('accepts valid cursor UUID', () => {
    const result = paginationSchema.parse({
      cursor: '550e8400-e29b-41d4-a716-446655440000',
      limit: 10,
    });
    expect(result.cursor).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(result.limit).toBe(10);
  });

  it('rejects non-UUID cursor', () => {
    expect(() => paginationSchema.parse({ cursor: 'not-a-uuid' })).toThrow();
  });

  it('rejects limit below 1', () => {
    expect(() => paginationSchema.parse({ limit: 0 })).toThrow();
  });

  it('rejects limit above MAX_PAGE_SIZE (100)', () => {
    expect(() => paginationSchema.parse({ limit: 101 })).toThrow();
  });

  it('accepts limit at boundaries', () => {
    expect(paginationSchema.parse({ limit: 1 }).limit).toBe(1);
    expect(paginationSchema.parse({ limit: 100 }).limit).toBe(100);
  });
});

describe('createListingSchema', () => {
  const validListing = {
    address: 'Bahnhofstrasse 1',
    plz: '8001',
    city: 'Zuerich',
    rooms: 3.5,
    priceChf: 2500,
  };

  it('accepts valid listing input', () => {
    const result = createListingSchema.parse(validListing);
    expect(result.address).toBe('Bahnhofstrasse 1');
    expect(result.rooms).toBe(3.5);
    expect(result.features).toEqual([]);
  });

  it('rejects missing required fields', () => {
    expect(() => createListingSchema.parse({})).toThrow();
    expect(() => createListingSchema.parse({ address: 'test' })).toThrow();
  });

  it('rejects rooms below 0.5', () => {
    expect(() => createListingSchema.parse({ ...validListing, rooms: 0 })).toThrow();
  });

  it('rejects rooms above 20', () => {
    expect(() => createListingSchema.parse({ ...validListing, rooms: 21 })).toThrow();
  });

  it('accepts rooms at boundaries', () => {
    expect(createListingSchema.parse({ ...validListing, rooms: 0.5 }).rooms).toBe(0.5);
    expect(createListingSchema.parse({ ...validListing, rooms: 20 }).rooms).toBe(20);
  });

  it('rejects price below 0', () => {
    expect(() => createListingSchema.parse({ ...validListing, priceChf: -1 })).toThrow();
  });

  it('rejects price above 100000', () => {
    expect(() => createListingSchema.parse({ ...validListing, priceChf: 100001 })).toThrow();
  });

  it('accepts optional fields', () => {
    const result = createListingSchema.parse({
      ...validListing,
      canton: 'ZH',
      areaSqm: 75,
      floor: 3,
      descriptionDe: 'Schoene Wohnung',
    });
    expect(result.canton).toBe('ZH');
    expect(result.areaSqm).toBe(75);
  });
});

describe('createApplicationSchema', () => {
  const validApplication = {
    listingId: '550e8400-e29b-41d4-a716-446655440000',
    applicantName: 'Max Muster',
    consent: true,
  };

  it('accepts valid application with defaults', () => {
    const result = createApplicationSchema.parse(validApplication);
    expect(result.applicantLanguage).toBe('de');
    expect(result.hasPets).toBe(false);
    expect(result.hasSwissResidence).toBe(true);
  });

  it('rejects invalid listing UUID', () => {
    expect(() => createApplicationSchema.parse({
      ...validApplication,
      listingId: 'not-uuid',
    })).toThrow();
  });

  it('rejects invalid email format', () => {
    expect(() => createApplicationSchema.parse({
      ...validApplication,
      applicantEmail: 'not-an-email',
    })).toThrow();
  });

  it('accepts valid language enum values', () => {
    for (const lang of ['de', 'fr', 'it', 'en']) {
      const result = createApplicationSchema.parse({
        ...validApplication,
        applicantLanguage: lang,
      });
      expect(result.applicantLanguage).toBe(lang);
    }
  });

  it('rejects invalid language', () => {
    expect(() => createApplicationSchema.parse({
      ...validApplication,
      applicantLanguage: 'es',
    })).toThrow();
  });
});

describe('inviteMemberSchema', () => {
  it('accepts valid input with default role', () => {
    const result = inviteMemberSchema.parse({ email: 'test@example.com' });
    expect(result.email).toBe('test@example.com');
    expect(result.role).toBe('viewer');
  });

  it('accepts explicit role', () => {
    const result = inviteMemberSchema.parse({ email: 'a@b.com', role: 'admin' });
    expect(result.role).toBe('admin');
  });

  it('rejects invalid role', () => {
    expect(() => inviteMemberSchema.parse({
      email: 'a@b.com',
      role: 'superadmin',
    })).toThrow();
  });

  it('rejects invalid email', () => {
    expect(() => inviteMemberSchema.parse({ email: 'not-email' })).toThrow();
  });
});

describe('updateListingStatusSchema', () => {
  it('accepts all valid statuses', () => {
    for (const status of ['draft', 'live', 'viewing', 'assigned', 'archived']) {
      const result = updateListingStatusSchema.parse({ status });
      expect(result.status).toBe(status);
    }
  });

  it('rejects invalid status', () => {
    expect(() => updateListingStatusSchema.parse({ status: 'deleted' })).toThrow();
  });

  it('rejects missing status', () => {
    expect(() => updateListingStatusSchema.parse({})).toThrow();
  });
});
