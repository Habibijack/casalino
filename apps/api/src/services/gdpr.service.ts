import { eq, and, isNull, inArray } from 'drizzle-orm';
import { getDb } from '../lib/db';
import {
  organizations,
  listings,
  applications,
  orgMembers,
} from '@casalino/db/schema';
import { AppError } from '../lib/errors';
import { writeAuditLog } from '../lib/query-helpers';

// ---------------------
// Export all org data as JSON (GDPR Art. 20)
// ---------------------

export async function exportOrgData(orgId: string) {
  const db = getDb();

  const [org] = await db
    .select()
    .from(organizations)
    .where(
      and(
        eq(organizations.id, orgId),
        isNull(organizations.deletedAt),
      ),
    )
    .limit(1);

  if (!org) {
    throw AppError.notFound('Organisation');
  }

  const orgListings = await db
    .select()
    .from(listings)
    .where(
      and(
        eq(listings.orgId, orgId),
        isNull(listings.deletedAt),
      ),
    );

  const listingIds = orgListings.map((l) => l.id);

  let orgApplications: Array<{
    id: string;
    listingId: string;
    applicantName: string;
    applicantEmail: string | null;
    applicantPhone: string | null;
    status: string;
    scoreTotal: number | null;
    createdAt: Date;
  }> = [];

  if (listingIds.length > 0) {
    orgApplications = await db
      .select({
        id: applications.id,
        listingId: applications.listingId,
        applicantName: applications.applicantName,
        applicantEmail: applications.applicantEmail,
        applicantPhone: applications.applicantPhone,
        status: applications.status,
        scoreTotal: applications.scoreTotal,
        createdAt: applications.createdAt,
      })
      .from(applications)
      .where(
        and(
          inArray(applications.listingId, listingIds),
          isNull(applications.deletedAt),
        ),
      );
  }

  const members = await db
    .select()
    .from(orgMembers)
    .where(eq(orgMembers.orgId, orgId));

  return {
    exportedAt: new Date().toISOString(),
    organization: {
      name: org.name,
      slug: org.slug,
      contactEmail: org.contactEmail,
      city: org.city,
      canton: org.canton,
      createdAt: org.createdAt,
    },
    listings: orgListings.map((l) => ({
      id: l.id,
      address: l.address,
      city: l.city,
      priceChf: l.priceChf,
      status: l.status,
      createdAt: l.createdAt,
    })),
    applications: orgApplications,
    members: members.map((m) => ({
      role: m.role,
      joinedAt: m.joinedAt,
    })),
  };
}

// ---------------------
// Soft-delete all org data (GDPR Art. 17)
// ---------------------

export async function softDeleteOrg(
  orgId: string,
  userId: string,
) {
  const db = getDb();
  const now = new Date();

  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(
      and(
        eq(organizations.id, orgId),
        isNull(organizations.deletedAt),
      ),
    )
    .limit(1);

  if (!org) {
    throw AppError.notFound('Organisation');
  }

  // Soft delete the organization
  await db
    .update(organizations)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(organizations.id, orgId));

  // Soft delete all listings belonging to this org
  await db
    .update(listings)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(listings.orgId, orgId));

  // Soft delete applications for this org's listings
  const orgListings = await db
    .select({ id: listings.id })
    .from(listings)
    .where(eq(listings.orgId, orgId));

  const listingIds = orgListings.map((l) => l.id);

  if (listingIds.length > 0) {
    await db
      .update(applications)
      .set({ deletedAt: now, updatedAt: now })
      .where(inArray(applications.listingId, listingIds));
  }

  // Write audit log
  await writeAuditLog({
    orgId,
    userId,
    action: 'gdpr.org_deleted',
    entityType: 'organization',
    entityId: orgId,
    details: { deletedAt: now.toISOString() },
  });

  return { deletedAt: now.toISOString() };
}
