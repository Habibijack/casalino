import { eq, desc } from 'drizzle-orm';
import { auditLog, users } from '@casalino/db/schema';
import { getDb } from '../lib/db';

// ---------------------
// Activity log entry
// ---------------------

interface ActivityEntry {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  userId: string | null;
  userName: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

// ---------------------
// List activity logs
// ---------------------

export async function listActivity(
  orgId: string,
  limit: number,
): Promise<ActivityEntry[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      userId: auditLog.userId,
      userName: users.fullName,
      details: auditLog.details,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.userId, users.id))
    .where(eq(auditLog.orgId, orgId))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);

  return rows;
}
