import { eq, and } from 'drizzle-orm';
import { orgMembers, users, organizations } from '@casalino/db/schema';
import type { InviteMemberInput, UpdateMemberRoleInput } from '@casalino/shared';
import { getDb } from '../lib/db';
import { AppError } from '../lib/errors';
import { writeAuditLog } from '../lib/query-helpers';
import { emailQueue } from '../lib/queues';

// ---------------------
// List members
// ---------------------

export async function listMembers(orgId: string) {
  const db = getDb();

  const rows = await db
    .select({
      id: orgMembers.id,
      userId: orgMembers.userId,
      role: orgMembers.role,
      joinedAt: orgMembers.joinedAt,
      email: users.email,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
    })
    .from(orgMembers)
    .innerJoin(users, eq(orgMembers.userId, users.id))
    .where(eq(orgMembers.orgId, orgId));

  return rows;
}

// ---------------------
// Invite member
// ---------------------

export async function inviteMember(
  orgId: string,
  invitedByUserId: string,
  input: InviteMemberInput,
) {
  const db = getDb();

  // Check if user exists
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user) {
    throw AppError.notFound(
      'Benutzer mit dieser E-Mail nicht gefunden. Der Benutzer muss sich zuerst registrieren.',
    );
  }

  // Check if already a member
  const [existing] = await db
    .select({ id: orgMembers.id })
    .from(orgMembers)
    .where(
      and(
        eq(orgMembers.orgId, orgId),
        eq(orgMembers.userId, user.id),
      ),
    )
    .limit(1);

  if (existing) {
    throw AppError.conflict('Dieser Benutzer ist bereits Mitglied');
  }

  const [member] = await db
    .insert(orgMembers)
    .values({
      orgId,
      userId: user.id,
      role: input.role,
      invitedBy: invitedByUserId,
    })
    .returning();

  // Get org name for email
  const [org] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  await writeAuditLog({
    orgId,
    userId: invitedByUserId,
    action: 'member.invited',
    entityType: 'member',
    entityId: member!.id,
    details: { email: input.email, role: input.role },
  });

  // Get inviter name for email
  const [inviter] = await db
    .select({ fullName: users.fullName })
    .from(users)
    .where(eq(users.id, invitedByUserId))
    .limit(1);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3737';

  // Send invitation email
  await emailQueue.add('member-invitation', {
    type: 'member-invitation',
    to: input.email,
    orgName: org?.name ?? 'Organisation',
    inviterName: inviter?.fullName ?? 'Ihr Team',
    inviteUrl: `${appUrl}/dashboard`,
    role: input.role,
  });

  return member!;
}

// ---------------------
// Update role
// ---------------------

export async function updateMemberRole(
  orgId: string,
  adminUserId: string,
  memberId: string,
  input: UpdateMemberRoleInput,
) {
  const db = getDb();

  const [member] = await db
    .select({
      id: orgMembers.id,
      userId: orgMembers.userId,
      role: orgMembers.role,
    })
    .from(orgMembers)
    .where(and(eq(orgMembers.id, memberId), eq(orgMembers.orgId, orgId)))
    .limit(1);

  if (!member) {
    throw AppError.notFound('Mitglied');
  }

  // Cannot change own role
  if (member.userId === adminUserId) {
    throw AppError.validation('Sie koennen Ihre eigene Rolle nicht aendern');
  }

  const [updated] = await db
    .update(orgMembers)
    .set({ role: input.role, updatedAt: new Date() })
    .where(eq(orgMembers.id, memberId))
    .returning();

  await writeAuditLog({
    orgId,
    userId: adminUserId,
    action: 'member.role_changed',
    entityType: 'member',
    entityId: memberId,
    details: { from: member.role, to: input.role },
  });

  return updated!;
}

// ---------------------
// Remove member
// ---------------------

export async function removeMember(
  orgId: string,
  adminUserId: string,
  memberId: string,
) {
  const db = getDb();

  const [member] = await db
    .select({ id: orgMembers.id, userId: orgMembers.userId })
    .from(orgMembers)
    .where(and(eq(orgMembers.id, memberId), eq(orgMembers.orgId, orgId)))
    .limit(1);

  if (!member) {
    throw AppError.notFound('Mitglied');
  }

  if (member.userId === adminUserId) {
    throw AppError.validation('Sie koennen sich nicht selbst entfernen');
  }

  await db.delete(orgMembers).where(eq(orgMembers.id, memberId));

  await writeAuditLog({
    orgId,
    userId: adminUserId,
    action: 'member.removed',
    entityType: 'member',
    entityId: memberId,
  });
}

// ---------------------
// Get org details
// ---------------------

export async function getOrganization(orgId: string) {
  const db = getDb();

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!org) {
    throw AppError.notFound('Organisation');
  }

  return org;
}

// ---------------------
// Update org
// ---------------------

export async function updateOrganization(
  orgId: string,
  userId: string,
  data: Record<string, unknown>,
) {
  const db = getDb();

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  const allowedFields = [
    'name', 'contactEmail', 'contactPhone',
    'website', 'address', 'city', 'postalCode', 'canton',
    'settings', 'scoringWeights',
  ];

  for (const field of allowedFields) {
    if (field in data) {
      updateData[field] = data[field];
    }
  }

  const [updated] = await db
    .update(organizations)
    .set(updateData)
    .where(eq(organizations.id, orgId))
    .returning();

  await writeAuditLog({
    orgId,
    userId,
    action: 'organization.updated',
    entityType: 'organization',
    entityId: orgId,
  });

  return updated!;
}
