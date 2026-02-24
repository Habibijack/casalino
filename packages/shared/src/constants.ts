// Casalino B2B Constants

export const APP_NAME = 'Casalino';
export const APP_URL = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : 'https://app.casalino.ch';

// Organization member roles
export const ORG_ROLES = ['admin', 'editor', 'viewer'] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

// Listing statuses
export const LISTING_STATUSES = {
  draft: { label: 'Entwurf', variant: 'secondary' },
  live: { label: 'Live', variant: 'success' },
  viewing: { label: 'Besichtigung', variant: 'info' },
  assigned: { label: 'Vergeben', variant: 'accent' },
  archived: { label: 'Archiviert', variant: 'secondary' },
} as const;
export type ListingStatus = keyof typeof LISTING_STATUSES;

// Application statuses
export const APPLICATION_STATUSES = {
  new: { label: 'Neu', variant: 'info' },
  screening: { label: 'In Pruefung', variant: 'warning' },
  invited: { label: 'Eingeladen', variant: 'success' },
  rejected: { label: 'Abgesagt', variant: 'destructive' },
  confirmed: { label: 'Zugesagt', variant: 'accent' },
} as const;
export type ApplicationStatus = keyof typeof APPLICATION_STATUSES;

// Viewing statuses
export const VIEWING_STATUSES = {
  invited: { label: 'Eingeladen', variant: 'warning' },
  confirmed: { label: 'Bestaetigt', variant: 'success' },
  noshow: { label: 'No-Show', variant: 'destructive' },
  appeared: { label: 'Erschienen', variant: 'info' },
} as const;
export type ViewingStatus = keyof typeof VIEWING_STATUSES;

// Contract statuses
export const CONTRACT_STATUSES = {
  draft: { label: 'Entwurf', variant: 'secondary' },
  sent: { label: 'Gesendet', variant: 'info' },
  signed: { label: 'Unterschrieben', variant: 'success' },
} as const;
export type ContractStatus = keyof typeof CONTRACT_STATUSES;

// Dossier statuses
export const DOSSIER_STATUSES = {
  complete: { label: 'Komplett', variant: 'success' },
  incomplete: { label: 'Unvollstaendig', variant: 'warning' },
  reviewing: { label: 'In Pruefung', variant: 'info' },
} as const;
export type DossierStatus = keyof typeof DOSSIER_STATUSES;

// Communication types
export const COMMUNICATION_TYPES = [
  'rejection',
  'invitation',
  'document_request',
  'confirmation',
  'reminder',
] as const;
export type CommunicationType = (typeof COMMUNICATION_TYPES)[number];

// Document types
export const DOCUMENT_TYPES = [
  'betreibungsauszug',
  'lohnausweis',
  'ausweis',
  'arbeitsvertrag',
  'vermieter_referenz',
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

// Scoring weights (default)
export const DEFAULT_SCORING_WEIGHTS = {
  financial: 35,
  dossier: 25,
  matching: 20,
  communication: 10,
  credit: 10,
} as const;

// Financial thresholds
export const FINANCIAL_THRESHOLDS = {
  excellent: { ratio: 3.5, points: 35 },
  good: { ratio: 3.0, points: 28 },
  acceptable: { ratio: 2.5, points: 20 },
  risk: { ratio: 0, points: 10 },
} as const;

// Dossier points per document type
export const DOSSIER_POINTS = {
  betreibungsauszug: 8,
  lohnausweis: 7,
  ausweis: 5,
  arbeitsvertrag: 3,
  vermieter_referenz: 2,
} as const;

// Score thresholds
export const SCORE_THRESHOLDS = {
  top: { min: 80, label: 'Top-Kandidat', variant: 'success' },
  good: { min: 60, label: 'Gut', variant: 'info' },
  average: { min: 40, label: 'Durchschnitt', variant: 'warning' },
  below: { min: 0, label: 'Unter Schwelle', variant: 'destructive' },
} as const;

export const AUTO_REJECT_THRESHOLD = 50;

// Swiss cantons
export const SWISS_CANTONS = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
  'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
  'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH',
] as const;
export type SwissCanton = (typeof SWISS_CANTONS)[number];

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// AI model routing
export const AI_MODELS = {
  fast: 'claude-haiku-4-5-20251001',
  quality: 'claude-sonnet-4-5-20250514',
} as const;

export const AI_ROUTING = {
  applicantScreening: AI_MODELS.fast,
  applicantRanking: AI_MODELS.quality,
  applicantSummary: AI_MODELS.fast,
  listingGeneration: AI_MODELS.quality,
  communicationDraft: AI_MODELS.fast,
  contractGeneration: AI_MODELS.quality,
} as const;
