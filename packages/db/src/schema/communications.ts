import { pgTable, uuid, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { applications } from './applications';

export const communications = pgTable('communications', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicationId: uuid('application_id').notNull().references(() => applications.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  language: text('language').notNull(),
  subject: text('subject'),
  content: text('content').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  delivered: boolean('delivered'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('communications_application_id_idx').on(table.applicationId),
]);

export const communicationsRelations = relations(communications, ({ one }) => ({
  application: one(applications, {
    fields: [communications.applicationId],
    references: [applications.id],
  }),
}));
