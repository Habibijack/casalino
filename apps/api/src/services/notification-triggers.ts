import { eq } from 'drizzle-orm';
import { orgMembers, notifications } from '@casalino/db/schema';
import { getDb } from '../lib/db';

// ---------------------
// Notify all org members (for public/system events with no actor)
// ---------------------

interface NotifyAllInput {
  orgId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

export async function notifyAllOrgMembers(
  input: NotifyAllInput,
): Promise<void> {
  try {
    const db = getDb();

    const members = await db
      .select({ userId: orgMembers.userId })
      .from(orgMembers)
      .where(eq(orgMembers.orgId, input.orgId));

    if (members.length === 0) return;

    const values = members.map((m) => ({
      orgId: input.orgId,
      userId: m.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
    }));

    await db.insert(notifications).values(values);
  } catch (err) {
    // Notification failures should never block the main flow
    console.error('[notifications] Failed to send notifications:', err);
  }
}
