import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getStripe(): Stripe | null {
  if (_stripe) return _stripe;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  _stripe = new Stripe(secretKey, {
    apiVersion: '2026-01-28.clover',
  });

  return _stripe;
}

// ---------------------
// Checkout Session
// ---------------------

interface CheckoutParams {
  orgId: string;
  priceId: string;
  feature?: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
}

export async function createCheckoutSession(
  params: CheckoutParams,
): Promise<{ id: string; url: string }> {
  const stripe = getStripe();

  if (!stripe) {
    console.warn('[stripe] No STRIPE_SECRET_KEY, returning mock checkout');
    return {
      id: `cs_mock_${Date.now()}`,
      url: `${params.successUrl}?session_id=cs_mock_${Date.now()}`,
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.orgId,
    ...(params.customerId ? { customer: params.customerId } : {}),
    metadata: { orgId: params.orgId, feature: params.feature ?? '' },
  });

  return {
    id: session.id,
    url: session.url ?? params.successUrl,
  };
}

// ---------------------
// Billing Portal
// ---------------------

interface PortalParams {
  customerId: string;
  returnUrl: string;
}

export async function createBillingPortalSession(
  params: PortalParams,
): Promise<{ id: string; url: string }> {
  const stripe = getStripe();

  if (!stripe) {
    console.warn('[stripe] No STRIPE_SECRET_KEY, returning mock portal');
    return {
      id: `bps_mock_${Date.now()}`,
      url: params.returnUrl,
    };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return {
    id: session.id,
    url: session.url,
  };
}

// ---------------------
// Webhook verification
// ---------------------

export function constructWebhookEvent(
  payload: string,
  signature: string,
): Stripe.Event | null {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    console.warn('[stripe] Cannot verify webhook: missing key or secret');
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('[stripe] Webhook verification failed:', err);
    return null;
  }
}
