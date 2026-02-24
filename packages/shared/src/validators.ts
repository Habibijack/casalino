import { z } from 'zod';
import { MAX_PAGE_SIZE, SWISS_CANTONS } from './constants';

// ---------------------
// Pagination
// ---------------------

export const paginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(MAX_PAGE_SIZE).default(20),
  direction: z.enum(['forward', 'backward']).default('forward'),
});

// ---------------------
// Organization
// ---------------------

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(50).optional(),
  website: z.string().url().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(10).optional(),
  canton: z.enum(SWISS_CANTONS).optional(),
});

// ---------------------
// Org Members
// ---------------------

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer']),
});

// ---------------------
// Listings
// ---------------------

export const createListingSchema = z.object({
  referenceNumber: z.string().max(50).optional(),
  address: z.string().min(3).max(255),
  plz: z.string().min(4).max(10),
  city: z.string().min(1).max(100),
  canton: z.enum(SWISS_CANTONS).optional(),
  rooms: z.number().min(0.5).max(20),
  areaSqm: z.number().min(1).max(10000).optional(),
  priceChf: z.number().min(0).max(100000),
  nkChf: z.number().min(0).max(10000).optional(),
  floor: z.number().min(-5).max(100).optional(),
  availableFrom: z.string().datetime().optional(),
  descriptionDe: z.string().max(5000).optional(),
  descriptionFr: z.string().max(5000).optional(),
  descriptionIt: z.string().max(5000).optional(),
  features: z.array(z.string()).default([]),
});

export const updateListingSchema = createListingSchema.partial();

export const updateListingStatusSchema = z.object({
  status: z.enum(['draft', 'live', 'viewing', 'assigned', 'archived']),
});

export const listingFilterSchema = z.object({
  status: z.enum(['draft', 'live', 'viewing', 'assigned', 'archived']).optional(),
  city: z.string().optional(),
  canton: z.enum(SWISS_CANTONS).optional(),
  search: z.string().max(200).optional(),
}).merge(paginationSchema);

// ---------------------
// Applications
// ---------------------

export const createApplicationSchema = z.object({
  listingId: z.string().uuid(),
  applicantName: z.string().min(2).max(255),
  applicantEmail: z.string().email().optional(),
  applicantPhone: z.string().max(50).optional(),
  applicantLanguage: z.enum(['de', 'fr', 'it', 'en']).default('de'),
  householdSize: z.number().min(1).max(20).optional(),
  incomeChf: z.number().min(0).optional(),
  employmentType: z.string().max(50).optional(),
  hasPets: z.boolean().default(false),
  petType: z.string().max(50).optional(),
  desiredMoveDate: z.string().optional(),
  coverLetter: z.string().max(5000).optional(),
  hasSwissResidence: z.boolean().default(true),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Einwilligung ist erforderlich',
  }),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['new', 'screening', 'invited', 'rejected', 'confirmed']),
});

// ---------------------
// Viewings
// ---------------------

export const createViewingSchema = z.object({
  listingId: z.string().uuid(),
  applicationId: z.string().uuid(),
  slotStart: z.string().datetime(),
  slotEnd: z.string().datetime(),
});

export const updateViewingStatusSchema = z.object({
  status: z.enum(['invited', 'confirmed', 'noshow', 'appeared']),
  feedbackPositive: z.boolean().optional(),
  feedbackNote: z.string().max(2000).optional(),
});

// ---------------------
// Contracts
// ---------------------

export const createContractSchema = z.object({
  listingId: z.string().uuid(),
  applicationId: z.string().uuid(),
});

export const updateContractStatusSchema = z.object({
  status: z.enum(['draft', 'sent', 'signed']),
});

// Contract Data (for PATCH /:id/data)
export const updateContractDataSchema = z.object({
  tenantName: z.string().min(1).max(255),
  tenantEmail: z.string().email(),
  tenantAddress: z.string().max(500),
  rentAmount: z.number().min(0).max(100000),
  nkAmount: z.number().min(0).max(10000).optional(),
  depositAmount: z.number().min(0).max(100000).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  specialClauses: z.array(z.string().max(1000)).max(20).optional(),
});

// Handover Protocol
export const updateHandoverDataSchema = z.object({
  handoverDate: z.string().min(1),
  rooms: z.array(z.object({
    room: z.string().min(1).max(100),
    condition: z.enum(['einwandfrei', 'maengel', 'schaeden']),
    notes: z.string().max(1000),
  })).max(20),
  meterReadings: z.object({
    electricity: z.number().min(0).optional(),
    water: z.number().min(0).optional(),
    heating: z.number().min(0).optional(),
  }),
  keysHandedOver: z.number().min(0).max(50),
  tenantSignature: z.boolean(),
  landlordSignature: z.boolean(),
  generalNotes: z.string().max(5000),
});

// Organization Update
export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(50).optional(),
  website: z.string().url().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(10).optional(),
  canton: z.enum(SWISS_CANTONS).optional(),
  settings: z.object({
    autoRejectThreshold: z.number().min(0).max(100).optional(),
    defaultViewingDuration: z.number().min(15).max(240).optional(),
    notificationEmail: z.string().email().optional(),
  }).optional(),
  scoringWeights: z.object({
    financial: z.number().min(0).max(100),
    dossier: z.number().min(0).max(100),
    matching: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
    credit: z.number().min(0).max(100),
  }).optional(),
});

// ---------------------
// Documents
// ---------------------

export const uploadDocumentSchema = z.object({
  applicationId: z.string().uuid(),
  type: z.enum([
    'betreibungsauszug',
    'lohnausweis',
    'ausweis',
    'arbeitsvertrag',
    'vermieter_referenz',
  ]),
  fileName: z.string().min(1).max(255),
  mimeType: z.string(),
});
