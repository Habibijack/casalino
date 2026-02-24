import type { ApiResponse, PaginatedResponse } from '@casalino/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ---------------------
// Core fetch wrapper
// ---------------------

interface FetchOptions {
  method?: string;
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
}

async function apiFetch<T>(
  path: string,
  opts: FetchOptions = {},
): Promise<T> {
  const { method = 'GET', body, token, signal } = opts;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
    cache: 'no-store',
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new ApiClientError(
      json.error.code,
      json.error.message,
      res.status,
    );
  }

  return json.data;
}

// ---------------------
// Error class
// ---------------------

export class ApiClientError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// ---------------------
// Typed API methods
// ---------------------

export function createApiClient(token: string) {
  return {
    listings: {
      list(params?: Record<string, string>) {
        const qs = params
          ? '?' + new URLSearchParams(params).toString()
          : '';
        return apiFetch<PaginatedResponse<ListingRow>>(
          `/listings${qs}`,
          { token },
        );
      },

      get(id: string) {
        return apiFetch<ListingRow>(`/listings/${id}`, { token });
      },

      create(data: Record<string, unknown>) {
        return apiFetch<ListingRow>('/listings', {
          method: 'POST',
          body: data,
          token,
        });
      },

      update(id: string, data: Record<string, unknown>) {
        return apiFetch<ListingRow>(`/listings/${id}`, {
          method: 'PATCH',
          body: data,
          token,
        });
      },

      updateStatus(id: string, status: string) {
        return apiFetch<ListingRow>(`/listings/${id}/status`, {
          method: 'PATCH',
          body: { status },
          token,
        });
      },

      delete(id: string) {
        return apiFetch<{ deleted: boolean }>(`/listings/${id}`, {
          method: 'DELETE',
          token,
        });
      },

      generateText(id: string) {
        return apiFetch<ListingRow>(`/listings/${id}/generate-text`, {
          method: 'POST',
          token,
        });
      },

      priceSuggestion(id: string) {
        return apiFetch<PriceSuggestionRow>(`/listings/${id}/price-suggestion`, {
          token,
        });
      },
    },

    applications: {
      list(params?: Record<string, string>) {
        const qs = params
          ? '?' + new URLSearchParams(params).toString()
          : '';
        return apiFetch<PaginatedResponse<ApplicationRow>>(
          `/applications${qs}`,
          { token },
        );
      },

      get(id: string) {
        return apiFetch<ApplicationDetail>(`/applications/${id}`, { token });
      },

      updateStatus(id: string, status: string) {
        return apiFetch<ApplicationRow>(`/applications/${id}/status`, {
          method: 'PATCH',
          body: { status },
          token,
        });
      },
    },

    viewings: {
      list(params?: Record<string, string>) {
        const qs = params
          ? '?' + new URLSearchParams(params).toString()
          : '';
        return apiFetch<PaginatedResponse<ViewingRow>>(
          `/viewings${qs}`,
          { token },
        );
      },

      get(id: string) {
        return apiFetch<ViewingDetail>(`/viewings/${id}`, { token });
      },

      create(data: Record<string, unknown>) {
        return apiFetch<ViewingRow>('/viewings', {
          method: 'POST',
          body: data,
          token,
        });
      },

      update(id: string, data: Record<string, unknown>) {
        return apiFetch<ViewingRow>(`/viewings/${id}`, {
          method: 'PATCH',
          body: data,
          token,
        });
      },

      delete(id: string) {
        return apiFetch<{ deleted: boolean }>(`/viewings/${id}`, {
          method: 'DELETE',
          token,
        });
      },
    },

    members: {
      list() {
        return apiFetch<MemberRow[]>('/members', { token });
      },

      activity(limit?: number) {
        const qs = limit ? `?limit=${limit}` : '';
        return apiFetch<ActivityEntry[]>(`/members/activity${qs}`, { token });
      },

      getOrganization() {
        return apiFetch<OrganizationRow>('/members/organization', { token });
      },

      updateOrganization(data: Record<string, unknown>) {
        return apiFetch<OrganizationRow>('/members/organization', {
          method: 'PATCH',
          body: data,
          token,
        });
      },

      invite(data: { email: string; role: string }) {
        return apiFetch<MemberRow>('/members/invite', {
          method: 'POST',
          body: data,
          token,
        });
      },

      updateRole(id: string, role: string) {
        return apiFetch<MemberRow>(`/members/${id}/role`, {
          method: 'PATCH',
          body: { role },
          token,
        });
      },

      remove(id: string) {
        return apiFetch<{ removed: boolean }>(`/members/${id}`, {
          method: 'DELETE',
          token,
        });
      },
    },
    contracts: {
      list() {
        return apiFetch<{ items: ContractRow[] }>('/contracts', { token });
      },

      get(id: string) {
        return apiFetch<ContractDetail>(`/contracts/${id}`, { token });
      },

      create(data: { listingId: string; applicationId: string }) {
        return apiFetch<ContractRow>('/contracts', {
          method: 'POST',
          body: data,
          token,
        });
      },

      updateData(id: string, contractData: Record<string, unknown>) {
        return apiFetch<ContractRow>(`/contracts/${id}/data`, {
          method: 'PATCH',
          body: contractData,
          token,
        });
      },

      send(id: string) {
        return apiFetch<ContractRow>(`/contracts/${id}/send`, {
          method: 'POST',
          token,
        });
      },

      updateHandover(id: string, data: Record<string, unknown>) {
        return apiFetch<ContractRow>(`/contracts/${id}/handover`, {
          method: 'PATCH',
          body: data,
          token,
        });
      },
    },

    dashboard: {
      stats() {
        return apiFetch<DashboardStatsRow>('/dashboard/stats', { token });
      },

      recentApplications() {
        return apiFetch<RecentApplicationRow[]>(
          '/dashboard/recent-applications',
          { token },
        );
      },
    },

    insights: {
      funnel() {
        return apiFetch<FunnelData>('/insights/funnel', { token });
      },

      scoringDistribution() {
        return apiFetch<ScoringDistributionData>(
          '/insights/scoring-distribution',
          { token },
        );
      },

      trend() {
        return apiFetch<TrendDataPoint[]>('/insights/trend', { token });
      },

      timeToFill() {
        return apiFetch<TimeToFillData>('/insights/time-to-fill', { token });
      },

      listingsPerformance() {
        return apiFetch<ListingPerformanceRow[]>(
          '/insights/listings-performance',
          { token },
        );
      },
    },

    notifications: {
      list(params?: Record<string, string>) {
        const qs = params
          ? '?' + new URLSearchParams(params).toString()
          : '';
        return apiFetch<NotificationRow[]>(
          `/notifications${qs}`,
          { token },
        );
      },

      unreadCount() {
        return apiFetch<{ count: number }>(
          '/notifications/count',
          { token },
        );
      },

      markRead(id: string) {
        return apiFetch<{ read: boolean }>(
          `/notifications/${id}/read`,
          { method: 'PATCH', token },
        );
      },

      markAllRead() {
        return apiFetch<{ readAll: boolean }>(
          '/notifications/read-all',
          { method: 'POST', token },
        );
      },
    },

    references: {
      getForApplication(applicationId: string) {
        return apiFetch<ReferenceCheckRow>(
          `/applications/${applicationId}/reference`,
          { token },
        );
      },

      create(data: {
        applicationId: string;
        landlordName: string;
        landlordEmail: string;
      }) {
        return apiFetch<ReferenceCheckRow>('/reference-checks', {
          method: 'POST',
          body: data,
          token,
        });
      },

      remind(id: string) {
        return apiFetch<ReferenceCheckRow>(
          `/reference-checks/${id}/remind`,
          { method: 'POST', token },
        );
      },
    },
  };
}

// Public API (no auth needed)
export function publicApiFetch<T>(path: string, opts: FetchOptions = {}) {
  return apiFetch<T>(`/public${path}`, opts);
}

// ---------------------
// Row types (match DB schema)
// ---------------------

export interface ApplicationRow {
  id: string;
  listingId: string;
  applicantName: string;
  applicantEmail: string | null;
  applicantPhone: string | null;
  applicantLanguage: string;
  householdSize: number | null;
  incomeChf: number | null;
  employmentType: string | null;
  hasPets: boolean;
  status: string;
  scoreTotal: number | null;
  aiSummary: string | null;
  scoredAt: string | null;
  createdAt: string;
  // Joined fields
  listingAddress?: string;
  listingCity?: string;
}

export interface ApplicationDetail extends ApplicationRow {
  petType: string | null;
  desiredMoveDate: string | null;
  coverLetter: string | null;
  hasSwissResidence: boolean;
  scoreFinancial: number | null;
  scoreDossier: number | null;
  scoreMatching: number | null;
  scoreCommunication: number | null;
  scoreCredit: number | null;
  updatedAt: string;
  listing: ListingRow;
  documents: DocumentRow[];
}

export interface DocumentRow {
  id: string;
  applicationId: string;
  type: string;
  fileName: string;
  storagePath: string;
  mimeType: string | null;
  verified: boolean;
  uploadedAt: string;
}

export interface ContractRow {
  id: string;
  listingId: string;
  applicationId: string;
  status: string;
  contractData: ContractDataPayload | null;
  sentAt: string | null;
  signedAt: string | null;
  createdAt: string;
  listingAddress?: string;
  listingCity?: string;
  applicantName?: string;
}

export interface ContractDataPayload {
  tenantName: string;
  tenantEmail: string;
  tenantAddress: string;
  rentAmount: number;
  nkAmount?: number;
  depositAmount?: number;
  startDate: string;
  endDate?: string;
  specialClauses?: string[];
}

export interface ContractDetail extends ContractRow {
  pdfStoragePath: string | null;
  signToken: string | null;
  updatedAt: string;
  listingPriceChf?: number;
  listingNkChf?: number | null;
  applicantEmail?: string | null;
}

export interface DashboardStatsRow {
  activeListings: number;
  openApplications: number;
  upcomingViewings: number;
  pendingContracts: number;
}

export interface RecentApplicationRow {
  id: string;
  applicantName: string;
  status: string;
  scoreTotal: number | null;
  createdAt: string;
  listingAddress: string;
  listingCity: string;
}

export interface MemberRow {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface OrganizationRow {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  canton: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ViewingRow {
  id: string;
  listingId: string;
  applicationId: string;
  slotStart: string;
  slotEnd: string;
  status: string;
  feedbackPositive: boolean | null;
  feedbackNote: string | null;
  reminderSent: boolean;
  createdAt: string;
  // Joined
  listingAddress?: string;
  listingCity?: string;
  applicantName?: string;
  applicantEmail?: string | null;
}

export interface ViewingDetail extends ViewingRow {
  updatedAt: string;
  applicantPhone?: string | null;
}

export interface ListingRow {
  id: string;
  orgId: string;
  referenceNumber: string | null;
  address: string;
  plz: string;
  city: string;
  canton: string | null;
  rooms: string;
  areaSqm: number | null;
  priceChf: number;
  nkChf: number | null;
  floor: number | null;
  availableFrom: string | null;
  status: string;
  descriptionDe: string | null;
  descriptionFr: string | null;
  descriptionIt: string | null;
  photos: Array<{ url: string; caption?: string; order: number }>;
  features: string[];
  criteria: Record<string, unknown>;
  portalIds: Record<string, unknown>;
  applicationCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface FunnelData {
  new: number;
  screening: number;
  invited: number;
  confirmed: number;
  rejected: number;
}

export interface ScoringDistributionData {
  top: number;
  good: number;
  average: number;
  below: number;
}

export interface TrendDataPoint {
  month: string;
  count: number;
}

export interface TimeToFillData {
  avgDays: number;
  minDays: number;
  maxDays: number;
  completedContracts: number;
}

export interface ListingPerformanceRow {
  id: string;
  address: string;
  city: string;
  status: string;
  priceChf: number;
  publishedAt: string | null;
  applicationCount: number;
  avgScore: number;
  topCandidates: number;
}

export interface PriceSuggestionRow {
  suggestedMin: number;
  suggestedMax: number;
  pricePerSqm: number;
  basis: string;
}

export interface ActivityEntry {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  userId: string | null;
  userName: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  read: boolean;
  createdAt: string;
}

export interface ReferenceCheckRow {
  id: string;
  applicationId: string;
  landlordName: string;
  landlordEmail: string;
  status: string;
  responses: {
    paymentPunctuality: number;
    propertyCondition: number;
    neighborBehavior: number;
    houseRulesCompliance: number;
    wouldRentAgain: boolean;
    comment?: string;
  } | null;
  scoreImpact: number | null;
  sentAt: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  remindedAt: string | null;
  createdAt: string;
}
