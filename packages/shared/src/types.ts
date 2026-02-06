import { z } from 'zod';
import {
  createUserSchema,
  createSearchProfileSchema,
  sendMessageSchema,
  uploadDocumentSchema,
  listingFilterSchema,
} from './validators';

// Inferred types from validators
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateSearchProfileInput = z.infer<typeof createSearchProfileSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type ListingFilterInput = z.infer<typeof listingFilterSchema>;

// API Response types
export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

// Chat types
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  chatType: 'main' | 'listing';
  listingId?: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: string;
};
