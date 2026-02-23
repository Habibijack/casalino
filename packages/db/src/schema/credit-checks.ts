import { pgTable, uuid, text, timestamp, integer, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { applications } from './applications';

export const creditChecks = pgTable('credit_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicationId: uuid('application_id').notNull().references(() => applications.id, { onDelete: 'cascade' }),
  tilbagoReference: text('tilbago_reference'),
  status: text('status').notNull().default('pending'),
  hasEntries: boolean('has_entries'),
  entryCount: integer('entry_count'),
  resultSummary: text('result_summary'),
  scoreImpact: integer('score_impact'),
  checkedAt: timestamp('checked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('credit_checks_application_id_idx').on(table.applicationId),
]);

export const creditChecksRelations = relations(creditChecks, ({ one }) => ({
  application: one(applications, {
    fields: [creditChecks.applicationId],
    references: [applications.id],
  }),
}));
