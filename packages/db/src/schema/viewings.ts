import { pgTable, uuid, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { listings } from './listings';
import { applications } from './applications';

export const viewings = pgTable('viewings', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  applicationId: uuid('application_id').notNull().references(() => applications.id, { onDelete: 'cascade' }),
  slotStart: timestamp('slot_start', { withTimezone: true }).notNull(),
  slotEnd: timestamp('slot_end', { withTimezone: true }).notNull(),
  status: text('status').notNull().default('invited'),
  feedbackPositive: boolean('feedback_positive'),
  feedbackNote: text('feedback_note'),
  reminderSent: boolean('reminder_sent').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('viewings_listing_id_idx').on(table.listingId),
  index('viewings_slot_start_idx').on(table.slotStart),
]);

export const viewingsRelations = relations(viewings, ({ one }) => ({
  listing: one(listings, {
    fields: [viewings.listingId],
    references: [listings.id],
  }),
  application: one(applications, {
    fields: [viewings.applicationId],
    references: [applications.id],
  }),
}));
