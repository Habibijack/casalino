import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { organizations, orgMembers } from '@casalino/db/schema';
import type { AppEnv } from '../types';
import { getDb } from '../lib/db';
import { AppError } from '../lib/errors';

const createOrgSchema = z.object({
  name: z.string().min(2).max(200),
  contactEmail: z.string().email().optional(),
});

export const onboardingRouter = new Hono<AppEnv>()

  // Create organization (for users without one)
  .post('/create-org', async (c) => {
    const userId = c.get('userId');
    const db = getDb();

    // Check user doesn't already have an org
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

    // Generate slug from name
    const slug = parsed.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100);

    // Check slug uniqueness, append random suffix if needed
    const [slugExists] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    const finalSlug = slugExists
      ? `${slug}-${Date.now().toString(36)}`
      : slug;

    // Create org
    const [org] = await db
      .insert(organizations)
      .values({
        name: parsed.data.name,
        slug: finalSlug,
        contactEmail: parsed.data.contactEmail ?? null,
      })
      .returning();

    // Add user as admin
    await db.insert(orgMembers).values({
      orgId: org!.id,
      userId,
      role: 'admin',
    });

    return c.json({ success: true, data: org }, 201);
  });
