import { z } from 'zod';
import { LOCALES, CHAT_TYPES, DOCUMENT_TYPES, LISTING_SOURCES } from './constants';

// User
export const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100).optional(),
  preferredLanguage: z.enum(LOCALES).default('de'),
});

// Search Profile
export const createSearchProfileSchema = z.object({
  name: z.string().min(1).max(100).default('Mein Suchprofil'),
  cities: z.array(z.string()).default([]),
  minRooms: z.number().min(1).max(10).optional(),
  maxRooms: z.number().min(1).max(10).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  maxCommute: z.number().min(0).max(120).optional(),
  keywords: z.array(z.string()).default([]),
});

// Chat Message
export const sendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  chatType: z.enum(CHAT_TYPES).default('main'),
  listingId: z.string().uuid().optional(),
  content: z.string().min(1).max(5000),
});

// Document Upload
export const uploadDocumentSchema = z.object({
  type: z.enum(DOCUMENT_TYPES),
  name: z.string().min(1).max(255),
  mimeType: z.string(),
  sizeBytes: z.number().max(10 * 1024 * 1024), // 10MB max
});

// Listing Filter
export const listingFilterSchema = z.object({
  city: z.string().optional(),
  minRooms: z.number().optional(),
  maxRooms: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  source: z.enum(LISTING_SOURCES).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});
