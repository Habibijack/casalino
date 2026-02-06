// Casalino Konstanten

export const APP_NAME = 'Casalino';
export const APP_URL = 'https://casalino.ch';

export const LOCALES = ['de', 'fr', 'it'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'de';

export const CHAT_TYPES = ['main', 'listing'] as const;
export type ChatType = (typeof CHAT_TYPES)[number];

export const DOCUMENT_TYPES = [
  'betreibungsauszug',
  'lohnausweis',
  'ausweis',
  'motivationsschreiben',
  'referenzen',
  'other',
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const SUBSCRIPTION_TIERS = ['free', 'premium', 'turbo'] as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export const LISTING_SOURCES = ['flatfox', 'homegate', 'immoscout24'] as const;
export type ListingSource = (typeof LISTING_SOURCES)[number];

export const SUBSCRIPTION_LIMITS = {
  free: {
    searchesPerDay: 3,
    alertDelay: 30, // minutes
    motivationLetters: 1,
    hasSprachBridge: false,
    hasInseratDecoder: false,
  },
  premium: {
    searchesPerDay: Infinity,
    alertDelay: 0,
    motivationLetters: 3,
    hasSprachBridge: true,
    hasInseratDecoder: false,
  },
  turbo: {
    searchesPerDay: Infinity,
    alertDelay: -5, // 5 min BEFORE others
    motivationLetters: Infinity,
    hasSprachBridge: true,
    hasInseratDecoder: true,
  },
} as const;
