import { eq, and, desc, sql } from 'drizzle-orm';
import { notifications, orgMembers } from '@casalino/db/schema';
import { getDb } from '../lib/db';

// ---------------------
// Create a single notification
// ---------------------

interface CreateNotificationInput {
  orgId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<void> {
  const db = getDb();
  await db.insert(notifications).values({
    orgId: input.orgId,
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
  });
}

// ---------------------
// Notify all org members (except actor)
// ---------------------

interface NotifyOrgMembersInput {
  orgId: string;
  excludeUserId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

export async function notifyOrgMembers(
  input: NotifyOrgMembersInput,
): Promise<void> {
  const db = getDb();

  const members = await db
    .select({ userId: orgMembers.userId })
    .from(orgMembers)
    .where(eq(orgMembers.orgId, input.orgId));

  const recipients = members.filter(
    (m) => m.userId !== input.excludeUserId,
  );

  if (recipients.length === 0) return;

  const values = recipients.map((r) => ({
    orgId: input.orgId,
    userId: r.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
  }));

  await db.insert(notifications).values(values);
}

// ---------------------
// Get notifications for a user
// ---------------------

interface GetNotificationsOpts {
  unreadOnly?: boolean;
  limit?: number;
}

export async function getNotifications(
  orgId: string,
  userId: string,
  opts: GetNotificationsOpts = {},
) {
  const db = getDb();
  const limit = opts.limit ?? 50;

  const conditions = [
    eq(notifications.orgId, orgId),
    eq(notifications.userId, userId),
  ];

  if (opts.unreadOnly) {
    conditions.push(eq(notifications.read, false));
  }

  return db
    .select({
      id: notifications.id,
      type: notifications.type,
      title: notifications.title,
      message: notifications.message,
      entityType: notifications.entityType,
      entityId: notifications.entityId,
      read: notifications.read,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

// ---------------------
// Unread count
// ---------------------

export async function getUnreadCount(
  orgId: string,
  userId: string,
): Promise<number> {
  const db = getDb();

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(
      and(
        eq(notifications.orgId, orgId),
        eq(notifications.userId, userId),
        eq(notifications.read, false),
      ),
    );

  return result[0]?.count ?? 0;
}

// ---------------------
// Mark one as read
// ---------------------

export async function markAsRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  const db = getDb();

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
      ),
    );
}

// ---------------------
// Mark all as read
// ---------------------

export async function markAllAsRead(
  orgId: string,
  userId: string,
): Promise<void> {
  const db = getDb();

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.orgId, orgId),
        eq(notifications.userId, userId),
        eq(notifications.read, false),
      ),
    );
}
