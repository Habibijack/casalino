import { sql, type SQL, gt, lt } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { getDb } from './db';
import { auditLog } from '@casalino/db/schema';
import { AppError } from './errors';

// ---------------------
// Cursor Pagination
// ---------------------

interface CursorPaginationOptions {
  cursor?: string;
  limit: number;
  direction: 'forward' | 'backward';
  idColumn: PgColumn;
}

export interface CursorResult<T> {
  items: T[];
  nextCursor: string | null;
  totalCount: number;
}

export function buildCursorCondition(
  opts: Pick<CursorPaginationOptions, 'cursor' | 'direction' | 'idColumn'>,
): SQL | undefined {
  if (!opts.cursor) return undefined;

  return opts.direction === 'forward'
    ? lt(opts.idColumn, opts.cursor)
    : gt(opts.idColumn, opts.cursor);
}

export function buildCursorResult<T extends { id: string }>(
  rows: T[],
  limit: number,
  totalCount: number,
): CursorResult<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore && items.length > 0
    ? items[items.length - 1]!.id
    : null;

  return { items, nextCursor, totalCount };
}

// ---------------------
// Role Guard
// ---------------------

type AllowedRole = 'admin' | 'editor' | 'viewer';

export function requireRole(
  currentRole: AllowedRole,
  ...allowed: AllowedRole[]
): void {
  if (!allowed.includes(currentRole)) {
    throw AppError.forbidden(`Rolle '${currentRole}' hat keine Berechtigung`);
  }
}

// ---------------------
// Audit Log
// ---------------------

interface AuditEntry {
  orgId: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  const db = getDb();
  await db.insert(auditLog).values({
    orgId: entry.orgId,
    userId: entry.userId,
    action: entry.action,
    entityType: entry.entityType ?? null,
    entityId: entry.entityId ?? null,
    details: entry.details ?? null,
  });
}

// ---------------------
// Count helper
// ---------------------

export async function countRows(
  table: PgTable,
  where?: SQL,
): Promise<number> {
  const db = getDb();
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(table)
    .where(where);

  return result[0]?.count ?? 0;
}
