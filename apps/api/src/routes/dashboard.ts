import { Hono } from 'hono';
import { eq, and, isNull, gte, desc, sql } from 'drizzle-orm';
import { listings, applications, viewings, contracts } from '@casalino/db/schema';
import type { AppEnv } from '../types';
import { getDb } from '../lib/db';
import { cacheOrCompute, orgCacheKey } from '../lib/cache';

export const dashboardRouter = new Hono<AppEnv>()

  .get('/stats', async (c) => {
    const orgId = c.get('orgId');

    const data = await cacheOrCompute(
      orgCacheKey(orgId, 'dashboard', 'stats'),
      60, // 1 minute TTL
      async () => {
        const db = getDb();
        const [
          activeListingsResult,
          openApplicationsResult,
          upcomingViewingsResult,
          pendingContractsResult,
        ] = await Promise.all([
          db
            .select({ count: sql<number>`count(*)::int` })
            .from(listings)
            .where(
              and(
                eq(listings.orgId, orgId),
                eq(listings.status, 'live'),
                isNull(listings.deletedAt),
              ),
            ),
          db
            .select({ count: sql<number>`count(*)::int` })
            .from(applications)
            .innerJoin(listings, eq(applications.listingId, listings.id))
            .where(
              and(
                eq(listings.orgId, orgId),
                eq(applications.status, 'new'),
                isNull(applications.deletedAt),
              ),
            ),
          db
            .select({ count: sql<number>`count(*)::int` })
            .from(viewings)
            .innerJoin(listings, eq(viewings.listingId, listings.id))
            .where(
              and(
                eq(listings.orgId, orgId),
                gte(viewings.slotStart, new Date()),
              ),
            ),
          db
            .select({ count: sql<number>`count(*)::int` })
            .from(contracts)
            .innerJoin(listings, eq(contracts.listingId, listings.id))
            .where(
              and(
                eq(listings.orgId, orgId),
                eq(contracts.status, 'draft'),
              ),
            ),
        ]);

        return {
          activeListings: activeListingsResult[0]?.count ?? 0,
          openApplications: openApplicationsResult[0]?.count ?? 0,
          upcomingViewings: upcomingViewingsResult[0]?.count ?? 0,
          pendingContracts: pendingContractsResult[0]?.count ?? 0,
        };
      },
    );

    return c.json({ success: true, data });
  })

  .get('/recent-applications', async (c) => {
    const orgId = c.get('orgId');
    const db = getDb();

    const recent = await db
      .select({
        id: applications.id,
        applicantName: applications.applicantName,
        status: applications.status,
        scoreTotal: applications.scoreTotal,
        createdAt: applications.createdAt,
        listingAddress: listings.address,
        listingCity: listings.city,
      })
      .from(applications)
      .innerJoin(listings, eq(applications.listingId, listings.id))
      .where(
        and(
          eq(listings.orgId, orgId),
          isNull(applications.deletedAt),
        ),
      )
      .orderBy(desc(applications.createdAt))
      .limit(5);

    return c.json({ success: true, data: recent });
  });
