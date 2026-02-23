import { pgTable, uuid, text, integer, timestamp, numeric, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';
import { applications } from './applications';
import { viewings } from './viewings';
import { contracts } from './contracts';

export interface ListingPhoto {
  url: string;
  caption?: string;
  order: number;
}

export interface ListingCriteria {
  maxHouseholdSize?: number;
  minIncome?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
}

export interface PortalIds {
  flatfox?: string;
  homegate?: string;
  immoscout?: string;
}

export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  referenceNumber: text('reference_number'),
  address: text('address').notNull(),
  plz: text('plz').notNull(),
  city: text('city').notNull(),
  canton: text('canton'),
  rooms: numeric('rooms', { precision: 3, scale: 1 }).notNull(),
  areaSqm: integer('area_sqm'),
  priceChf: integer('price_chf').notNull(),
  nkChf: integer('nk_chf'),
  floor: integer('floor'),
  availableFrom: timestamp('available_from', { withTimezone: true }),
  status: text('status').notNull().default('draft'),
  descriptionDe: text('description_de'),
  descriptionFr: text('description_fr'),
  descriptionIt: text('description_it'),
  photos: jsonb('photos').$type<ListingPhoto[]>().default([]),
  features: jsonb('features').$type<string[]>().default([]),
  criteria: jsonb('criteria').$type<ListingCriteria>().default({}),
  portalIds: jsonb('portal_ids').$type<PortalIds>().default({}),
  applicationCount: integer('application_count').notNull().default(0),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
  index('listings_org_id_idx').on(table.orgId),
  index('listings_status_idx').on(table.status),
]);

export const listingsRelations = relations(listings, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [listings.orgId],
    references: [organizations.id],
  }),
  applications: many(applications),
  viewings: many(viewings),
  contracts: many(contracts),
}));
