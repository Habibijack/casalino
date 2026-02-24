import { Hono } from 'hono';
import { eq, and, isNull, sql, gte, desc } from 'drizzle-orm';
import { listings, applications, viewings, contracts } from '@casalino/db/schema';
import type { AppEnv } from '../types';
import { getDb } from '../lib/db';
import { cacheOrCompute, orgCacheKey } from '../lib/cache';

export const insightsRouter = new Hono<AppEnv>()

  // Funnel data: applications → screening → invited → confirmed
  .get('/funnel', async (c) => {
    const orgId = c.get('orgId');

    const data = await cacheOrCompute(
      orgCacheKey(orgId, 'insights', 'funnel'),
      300, // 5 min TTL
      async () => {
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

        return {
          new: funnelMap.get('new') ?? 0,
          screening: funnelMap.get('screening') ?? 0,
          invited: funnelMap.get('invited') ?? 0,
          confirmed: funnelMap.get('confirmed') ?? 0,
          rejected: funnelMap.get('rejected') ?? 0,
        };
      },
    );

    return c.json({ success: true, data });
  })

  // Scoring distribution: buckets of score ranges
  .get('/scoring-distribution', async (c) => {
    const orgId = c.get('orgId');

    const data = await cacheOrCompute(
      orgCacheKey(orgId, 'insights', 'scoring'),
      300,
      async () => {
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

        return {
          top: bucketMap.get('top') ?? 0,
          good: bucketMap.get('good') ?? 0,
          average: bucketMap.get('average') ?? 0,
          below: bucketMap.get('below') ?? 0,
        };
      },
    );

    return c.json({ success: true, data });
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
  })

  // Time-to-fill: avg days from listing published to contract signed
  .get('/time-to-fill', async (c) => {
    const orgId = c.get('orgId');
    const db = getDb();

    const result = await db
      .select({
        avgDays: sql<number>`
          COALESCE(
            ROUND(AVG(
              EXTRACT(EPOCH FROM (${contracts.signedAt} - ${listings.publishedAt})) / 86400
            )::numeric, 1),
            0
          )::float
        `,
        count: sql<number>`count(*)::int`,
        minDays: sql<number>`
          COALESCE(
            ROUND(MIN(
              EXTRACT(EPOCH FROM (${contracts.signedAt} - ${listings.publishedAt})) / 86400
            )::numeric, 0),
            0
          )::float
        `,
        maxDays: sql<number>`
          COALESCE(
            ROUND(MAX(
              EXTRACT(EPOCH FROM (${contracts.signedAt} - ${listings.publishedAt})) / 86400
            )::numeric, 0),
            0
          )::float
        `,
      })
      .from(contracts)
      .innerJoin(listings, eq(contracts.listingId, listings.id))
      .where(
        and(
          eq(listings.orgId, orgId),
          eq(contracts.status, 'signed'),
          sql`${contracts.signedAt} IS NOT NULL`,
          sql`${listings.publishedAt} IS NOT NULL`,
        ),
      );

    const row = result[0];

    return c.json({
      success: true,
      data: {
        avgDays: row?.avgDays ?? 0,
        minDays: row?.minDays ?? 0,
        maxDays: row?.maxDays ?? 0,
        completedContracts: row?.count ?? 0,
      },
    });
  })

  // Per-listing performance: apps count, avg score, status
  .get('/listings-performance', async (c) => {
    const orgId = c.get('orgId');
    const db = getDb();

    const rows = await db
      .select({
        id: listings.id,
        address: listings.address,
        city: listings.city,
        status: listings.status,
        priceChf: listings.priceChf,
        publishedAt: listings.publishedAt,
        applicationCount: sql<number>`count(${applications.id})::int`,
        avgScore: sql<number>`COALESCE(ROUND(AVG(${applications.scoreTotal})::numeric, 1), 0)::float`,
        topCandidates: sql<number>`count(*) FILTER (WHERE ${applications.scoreTotal} >= 80)::int`,
      })
      .from(listings)
      .leftJoin(
        applications,
        and(
          eq(applications.listingId, listings.id),
          isNull(applications.deletedAt),
        ),
      )
      .where(
        and(
          eq(listings.orgId, orgId),
          isNull(listings.deletedAt),
        ),
      )
      .groupBy(listings.id)
      .orderBy(desc(listings.createdAt))
      .limit(20);

    return c.json({ success: true, data: rows });
  });
