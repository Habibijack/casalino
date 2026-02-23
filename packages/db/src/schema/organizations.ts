import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { orgMembers } from './org-members';
import { listings } from './listings';

export interface OrgSettings {
  autoRejectThreshold?: number;
  defaultViewingDuration?: number;
  notificationEmail?: string;
}

export interface ScoringWeights {
  financial: number;
  dossier: number;
  matching: number;
  communication: number;
  credit: number;
}

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  logoUrl: text('logo_url'),
  website: text('website'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  address: text('address'),
  city: text('city'),
  postalCode: text('postal_code'),
  canton: text('canton'),
  settings: jsonb('settings').$type<OrgSettings>().default({}),
  scoringWeights: jsonb('scoring_weights').$type<ScoringWeights>().default({
    financial: 35,
    dossier: 25,
    matching: 20,
    communication: 10,
    credit: 10,
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(orgMembers),
  listings: many(listings),
}));
