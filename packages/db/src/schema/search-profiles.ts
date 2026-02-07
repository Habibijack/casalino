import { pgTable, uuid, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const searchProfiles = pgTable('search_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Profile basics
  name: text('name').notNull().default('Mein Suchprofil'),
  isActive: boolean('is_active').notNull().default(true),

  // Location
  cities: jsonb('cities').$type<string[]>().default([]),
  cantons: jsonb('cantons').$type<string[]>().default([]),
  maxCommuteMinutes: integer('max_commute_minutes'),
  commuteDestination: text('commute_destination'),

  // Apartment criteria
  minRooms: integer('min_rooms'),
  maxRooms: integer('max_rooms'),
  minPrice: integer('min_price'),
  maxPrice: integer('max_price'),
  minArea: integer('min_area'),
  maxArea: integer('max_area'),

  // Preferences
  keywords: jsonb('keywords').$type<string[]>().default([]),
  excludeKeywords: jsonb('exclude_keywords').$type<string[]>().default([]),
  preferredFloor: text('preferred_floor'),

  // Notification settings
  notifyEmail: boolean('notify_email').notNull().default(true),
  notifyFrequency: text('notify_frequency').notNull().default('instant'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
