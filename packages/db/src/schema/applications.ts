import { pgTable, uuid, text, integer, timestamp, boolean, date, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { listings } from './listings';
import { documents } from './documents';
import { creditChecks } from './credit-checks';
import { viewings } from './viewings';
import { communications } from './communications';
import { contracts } from './contracts';

export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  applicantName: text('applicant_name').notNull(),
  applicantEmail: text('applicant_email'),
  applicantPhone: text('applicant_phone'),
  applicantLanguage: text('applicant_language').notNull().default('de'),
  householdSize: integer('household_size'),
  incomeChf: integer('income_chf'),
  employmentType: text('employment_type'),
  hasPets: boolean('has_pets').notNull().default(false),
  petType: text('pet_type'),
  desiredMoveDate: date('desired_move_date'),
  coverLetter: text('cover_letter'),
  hasSwissResidence: boolean('has_swiss_residence').notNull().default(true),
  // Scoring
  scoreTotal: integer('score_total'),
  scoreFinancial: integer('score_financial'),
  scoreDossier: integer('score_dossier'),
  scoreMatching: integer('score_matching'),
  scoreCommunication: integer('score_communication'),
  scoreCredit: integer('score_credit'),
  aiSummary: text('ai_summary'),
  // Status
  status: text('status').notNull().default('new'),
  scoredAt: timestamp('scored_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
  index('applications_listing_id_idx').on(table.listingId),
  index('applications_status_idx').on(table.status),
  index('applications_score_total_idx').on(table.scoreTotal),
]);

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  listing: one(listings, {
    fields: [applications.listingId],
    references: [listings.id],
  }),
  documents: many(documents),
  creditChecks: many(creditChecks),
  viewings: many(viewings),
  communications: many(communications),
  contracts: many(contracts),
}));
