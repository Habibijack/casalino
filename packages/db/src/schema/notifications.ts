import { pgTable, uuid, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { users } from './users';

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('notifications_org_user_read_idx').on(table.orgId, table.userId, table.read),
  index('notifications_org_user_created_idx').on(table.orgId, table.userId, table.createdAt),
]);
