import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { organizations, orgMembers } from '@casalino/db/schema';
import { SWISS_CANTONS } from '@casalino/shared';
import type { AppEnv } from '../types';
import { getDb } from '../lib/db';
import { AppError } from '../lib/errors';
import { inviteMember } from '../services/members.service';

const createOrgSchema = z.object({
  name: z.string().min(2).max(200),
  contactEmail: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(10).optional(),
  canton: z.enum(SWISS_CANTONS).optional(),
});

const inviteTeamSchema = z.object({
  invites: z.array(
    z.object({
      email: z.string().email(),
      role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
    }),
  ).min(1).max(3),
});

export const onboardingRouter = new Hono<AppEnv>()

  // Create organization (for users without one)
  .post('/create-org', async (c) => {
    const userId = c.get('userId');
    const db = getDb();

    const [existing] = await db
      .select({ id: orgMembers.id })
      .from(orgMembers)
      .where(eq(orgMembers.userId, userId))
      .limit(1);

    if (existing) {
      throw AppError.conflict('Sie sind bereits Mitglied einer Organisation');
    }

    const body = await c.req.json();
    const parsed = createOrgSchema.safeParse(body);

    if (!parsed.success) {
      throw AppError.validation(
        parsed.error.errors[0]?.message ?? 'Ungueltige Daten',
      );
    }

    const slug = generateSlug(parsed.data.name);

    const [slugExists] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    const finalSlug = slugExists
      ? `${slug}-${Date.now().toString(36)}`
      : slug;

    const [org] = await db
      .insert(organizations)
      .values({
        name: parsed.data.name,
        slug: finalSlug,
        contactEmail: parsed.data.contactEmail ?? null,
        contactPhone: parsed.data.phone ?? null,
        address: parsed.data.address ?? null,
        city: parsed.data.city ?? null,
        postalCode: parsed.data.postalCode ?? null,
        canton: parsed.data.canton ?? null,
      })
      .returning();

    await db.insert(orgMembers).values({
      orgId: org!.id,
      userId,
      role: 'admin',
    });

    return c.json({ success: true, data: org }, 201);
  })

  // Invite team members during onboarding
  .post('/invite-team', async (c) => {
    const userId = c.get('userId');
    const db = getDb();

    const [membership] = await db
      .select({ orgId: orgMembers.orgId, role: orgMembers.role })
      .from(orgMembers)
      .where(eq(orgMembers.userId, userId))
      .limit(1);

    if (!membership) {
      throw AppError.notFound('Sie muessen zuerst eine Organisation erstellen');
    }

    const body = await c.req.json();
    const parsed = inviteTeamSchema.safeParse(body);

    if (!parsed.success) {
      throw AppError.validation(
        parsed.error.errors[0]?.message ?? 'Ungueltige Daten',
      );
    }

    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    for (const invite of parsed.data.invites) {
      try {
        await inviteMember(membership.orgId, userId, invite);
        results.push({ email: invite.email, success: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
        results.push({ email: invite.email, success: false, error: message });
      }
    }

    return c.json({ success: true, data: { results } }, 201);
  });

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}
