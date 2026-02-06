import { pgTable, uuid, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const searchProfiles = pgTable('search_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull().default('Mein Suchprofil'),
  cities: jsonb('cities').$type<string[]>().default([]),
  minRooms: integer('min_rooms'),
  maxRooms: integer('max_rooms'),
  minPrice: integer('min_price'),
  maxPrice: integer('max_price'),
  maxCommute: integer('max_commute_minutes'),
  keywords: jsonb('keywords').$type<string[]>().default([]),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
