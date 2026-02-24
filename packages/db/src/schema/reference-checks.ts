import { pgTable, uuid, text, timestamp, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { applications } from './applications';

export interface ReferenceResponses {
  paymentPunctuality: number; // 1-5
  propertyCondition: number; // 1-5
  neighborBehavior: number; // 1-5
  houseRulesCompliance: number; // 1-5
  wouldRentAgain: boolean;
  comment?: string;
}

export const referenceChecks = pgTable('reference_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicationId: uuid('application_id').notNull().references(() => applications.id),
  landlordName: text('landlord_name').notNull(),
  landlordEmail: text('landlord_email').notNull(),
  status: text('status').notNull().default('pending'), // pending, sent, completed, expired
  token: text('token').unique().notNull(),
  responses: jsonb('responses').$type<ReferenceResponses>(),
  scoreImpact: integer('score_impact'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  remindedAt: timestamp('reminded_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('reference_checks_application_id_idx').on(table.applicationId),
  index('reference_checks_token_idx').on(table.token),
  index('reference_checks_status_idx').on(table.status),
]);

export const referenceChecksRelations = relations(referenceChecks, ({ one }) => ({
  application: one(applications, {
    fields: [referenceChecks.applicationId],
    references: [applications.id],
  }),
}));
