import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { AppEnv } from '../types';
import { requireRole } from '../lib/query-helpers';
import {
  createCheckoutSession,
  createBillingPortalSession,
  constructWebhookEvent,
} from '../lib/stripe';
import { getDb } from '../lib/db';
import { organizations } from '@casalino/db/schema';
import type { OrgSettings } from '@casalino/db/schema';
import { AppError } from '../lib/errors';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3737';

// Feature pricing (CHF)
const FEATURE_PRICES: Record<string, { label: string; priceId: string; amount: number }> = {
  scoring: { label: 'AI Screening', priceId: 'price_scoring', amount: 199 },
  creditCheck: { label: 'Bonitaetspruefung', priceId: 'price_credit', amount: 9 },
  contract: { label: 'Vertragserstellung', priceId: 'price_contract', amount: 49 },
};

export const billingRouter = new Hono<AppEnv>()

  // Get billing info / feature prices
  .get('/', async (c) => {
    const orgId = c.get('orgId');
    const db = getDb();

    const [org] = await db
      .select({ settings: organizations.settings })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    const settings = (org?.settings ?? {}) as OrgSettings;

    return c.json({
      success: true,
      data: {
        features: FEATURE_PRICES,
        currentPlan: 'free',
        activatedFeatures: settings.activatedFeatures ?? [],
        settings,
      },
    });
  })

  // Create checkout session for a feature
  .post('/checkout', async (c) => {
    const orgId = c.get('orgId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin');

    const body = await c.req.json();
    const feature = typeof body === 'object' && body !== null && 'feature' in body
      ? String(body.feature)
      : '';

    const pricing = FEATURE_PRICES[feature];
    if (!pricing) {
      throw AppError.validation('Ungueltiges Feature');
    }

    // Look up existing Stripe customer ID from org settings
    const db = getDb();
    const [org] = await db
      .select({ settings: organizations.settings })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    const settings = (org?.settings ?? {}) as OrgSettings;

    const session = await createCheckoutSession({
      orgId,
      priceId: pricing.priceId,
      feature,
      successUrl: `${APP_URL}/settings/billing?success=true`,
      cancelUrl: `${APP_URL}/settings/billing?canceled=true`,
      customerId: settings.stripeCustomerId,
    });

    return c.json({ success: true, data: { url: session.url } });
  })

  // Create billing portal session
  .post('/portal', async (c) => {
    const orgId = c.get('orgId');
    const orgRole = c.get('orgRole');
    requireRole(orgRole, 'admin');

    const db = getDb();
    const [org] = await db
      .select({ settings: organizations.settings })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    const settings = (org?.settings ?? {}) as OrgSettings;

    if (!settings.stripeCustomerId) {
      throw AppError.validation('Kein Stripe-Konto verknuepft. Bitte zuerst ein Feature aktivieren.');
    }

    const session = await createBillingPortalSession({
      customerId: settings.stripeCustomerId,
      returnUrl: `${APP_URL}/settings/billing`,
    });

    return c.json({ success: true, data: { url: session.url } });
  });

// ---------------------
// Stripe Webhook (public, no auth)
// ---------------------

export const stripeWebhookRouter = new Hono()

  .post('/', async (c) => {
    const signature = c.req.header('stripe-signature');
    if (!signature) {
      return c.json({ error: 'Missing signature' }, 400);
    }

    const rawBody = await c.req.text();
    const event = constructWebhookEvent(rawBody, signature);

    if (!event) {
      return c.json({ error: 'Invalid webhook' }, 400);
    }

    const db = getDb();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orgId = session.metadata?.orgId;
        const featureKey = session.metadata?.feature;
        const customerId = typeof session.customer === 'string'
          ? session.customer
          : null;

        if (orgId) {
          // Get current org settings
          const [org] = await db
            .select({ settings: organizations.settings })
            .from(organizations)
            .where(eq(organizations.id, orgId))
            .limit(1);

          const currentSettings = (org?.settings ?? {}) as OrgSettings;
          const activated = currentSettings.activatedFeatures ?? [];

          // Add the purchased feature if not already active
          if (featureKey && !activated.includes(featureKey)) {
            activated.push(featureKey);
          }

          const updatedSettings: OrgSettings = {
            ...currentSettings,
            activatedFeatures: activated,
          };

          // Store Stripe customer ID if we have one
          if (customerId) {
            updatedSettings.stripeCustomerId = customerId;
          }

          await db
            .update(organizations)
            .set({
              settings: updatedSettings,
              updatedAt: new Date(),
            })
            .where(eq(organizations.id, orgId));

          console.log(
            `[stripe] Checkout completed for org ${orgId}, feature: ${featureKey ?? 'unknown'}`,
          );
        }
        break;
      }
      default:
        console.log(`[stripe] Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true });
  });
