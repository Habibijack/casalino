import { pgTable, uuid, text, timestamp, integer, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { applications } from './applications';

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicationId: uuid('application_id').notNull().references(() => applications.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  fileName: text('file_name').notNull(),
  storagePath: text('storage_path').notNull(),
  mimeType: text('mime_type'),
  verified: boolean('verified').notNull().default(false),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('documents_application_id_idx').on(table.applicationId),
]);

export const documentsRelations = relations(documents, ({ one }) => ({
  application: one(applications, {
    fields: [documents.applicationId],
    references: [applications.id],
  }),
}));
