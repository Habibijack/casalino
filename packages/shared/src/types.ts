import { z } from 'zod';
import {
  createOrganizationSchema,
  createListingSchema,
  updateListingSchema,
  createApplicationSchema,
  createViewingSchema,
  createContractSchema,
  inviteMemberSchema,
  paginationSchema,
  listingFilterSchema,
  uploadDocumentSchema,
  updateListingStatusSchema,
  updateApplicationStatusSchema,
  updateViewingStatusSchema,
  updateContractStatusSchema,
  updateMemberRoleSchema,
  updateContractDataSchema,
  updateHandoverDataSchema,
  updateOrganizationSchema,
  createReferenceCheckSchema,
  submitReferenceSchema,
} from './validators';

// ---------------------
// Inferred Input Types
// ---------------------

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type UpdateListingStatusInput = z.infer<typeof updateListingStatusSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type CreateViewingInput = z.infer<typeof createViewingSchema>;
export type UpdateViewingStatusInput = z.infer<typeof updateViewingStatusSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractStatusInput = z.infer<typeof updateContractStatusSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ListingFilterInput = z.infer<typeof listingFilterSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type UpdateContractDataInput = z.infer<typeof updateContractDataSchema>;
export type UpdateHandoverDataInput = z.infer<typeof updateHandoverDataSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type CreateReferenceCheckInput = z.infer<typeof createReferenceCheckSchema>;
export type SubmitReferenceInput = z.infer<typeof submitReferenceSchema>;

// ---------------------
// API Response Types
// ---------------------

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export type PaginatedResponse<T> = {
  items: T[];
  nextCursor: string | null;
  totalCount: number;
};

// ---------------------
// Session Types
// ---------------------

export type SessionUser = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  orgId: string | null;
  orgRole: 'admin' | 'editor' | 'viewer' | null;
  orgName: string | null;
};

// ---------------------
// Dashboard Stats
// ---------------------

export type DashboardStats = {
  activeListings: number;
  openApplications: number;
  upcomingViewings: number;
  pendingContracts: number;
};

// ---------------------
// Scoring
// ---------------------

export type ScoreBreakdown = {
  financial: number;
  dossier: number;
  matching: number;
  communication: number;
  credit: number;
  total: number;
};
