import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { listings } from './listings';
import { applications } from './applications';

export interface ContractData {
  tenantName: string;
  tenantEmail: string;
  tenantAddress: string;
  rentAmount: number;
  nkAmount?: number;
  depositAmount?: number;
  startDate: string;
  endDate?: string;
  specialClauses?: string[];
}

export const contracts = pgTable('contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').notNull().references(() => listings.id),
  applicationId: uuid('application_id').notNull().references(() => applications.id),
  status: text('status').notNull().default('draft'),
  contractData: jsonb('contract_data').$type<ContractData>(),
  pdfStoragePath: text('pdf_storage_path'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  signedAt: timestamp('signed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('contracts_listing_id_idx').on(table.listingId),
]);

export const contractsRelations = relations(contracts, ({ one }) => ({
  listing: one(listings, {
    fields: [contracts.listingId],
    references: [listings.id],
  }),
  application: one(applications, {
    fields: [contracts.applicationId],
    references: [applications.id],
  }),
}));
