import { Hono } from 'hono';
import { eq, and, isNull, sql, gte, desc } from 'drizzle-orm';
import { listings, applications, viewings, contracts } from '@casalino/db/schema';
import type { AppEnv } from '../types';
import { getDb } from '../lib/db';

export const insightsRouter = new Hono<AppEnv>()

  // Funnel data: applications → screening → invited → confirmed
  .get('/funnel', async (c) => {
    const orgId = c.get('orgId');
    const db = getDb();

    const statusCounts = await db
      .select({
        status: applications.status,
        count: sql<number>`count(*)::int`,
      })
      .from(applications)
      .innerJoin(listings, eq(applications.listingId, listings.id))
      .where(
        and(
          eq(listings.orgId, orgId),
          isNull(applications.deletedAt),
        ),
      )
      .groupBy(applications.status);

    const funnelMap = new Map(statusCounts.map((r) => [r.status, r.count]));

    return c.json({
      success: true,
      data: {
        new: funnelMap.get('new') ?? 0,
        screening: funnelMap.get('screening') ?? 0,
        invited: funnelMap.get('invited') ?? 0,
        confirmed: funnelMap.get('confirmed') ?? 0,
        rejected: funnelMap.get('rejected') ?? 0,
      },
    });
  })

  // Scoring distribution: buckets of score ranges
  .get('/scoring-distribution', async (c) => {
    const orgId = c.get('orgId');
    const db = getDb();

    const buckets = await db
      .select({
        bucket: sql<string>`
          CASE
            WHEN ${applications.scoreTotal} >= 80 THEN 'top'
            WHEN ${applications.scoreTotal} >= 60 THEN 'good'
            WHEN ${applications.scoreTotal} >= 40 THEN 'average'
            ELSE 'below'
          END
        `,
        count: sql<number>`count(*)::int`,
      })
      .from(applications)
      .innerJoin(listings, eq(applications.listingId, listings.id))
      .where(
        and(
          eq(listings.orgId, orgId),
          isNull(applications.deletedAt),
          sql`${applications.scoreTotal} IS NOT NULL`,
        ),
      )
      .groupBy(sql`1`);

    const bucketMap = new Map(buckets.map((b) => [b.bucket, b.count]));

    return c.json({
      success: true,
      data: {
        top: bucketMap.get('top') ?? 0,
        good: bucketMap.get('good') ?? 0,
        average: bucketMap.get('average') ?? 0,
        below: bucketMap.get('below') ?? 0,
      },
    });
  })

  // Monthly applications trend (last 6 months)
  .get('/trend', async (c) => {
    const orgId = c.get('orgId');
    const db = getDb();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trend = await db
      .select({
        month: sql<string>`to_char(${applications.createdAt}, 'YYYY-MM')`,
        count: sql<number>`count(*)::int`,
      })
      .from(applications)
      .innerJoin(listings, eq(applications.listingId, listings.id))
      .where(
        and(
          eq(listings.orgId, orgId),
          isNull(applications.deletedAt),
          gte(applications.createdAt, sixMonthsAgo),
        ),
      )
      .groupBy(sql`1`)
      .orderBy(sql`1`);

    return c.json({ success: true, data: trend });
  });
