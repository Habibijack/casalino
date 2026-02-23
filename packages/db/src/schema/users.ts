import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { orgMembers } from './org-members';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  supabaseAuthId: text('supabase_auth_id').unique().notNull(),
  email: text('email').unique().notNull(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orgMemberships: many(orgMembers),
}));
