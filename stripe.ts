// ══════════════════════════════════════════════════════════════
// LisanIQ — Stripe Service
// All Stripe API operations are isolated here.
// Webhook verification, customer lifecycle, checkout sessions.
// ══════════════════════════════════════════════════════════════

import Stripe from 'stripe'

// ── Stripe client (server-side only) ───────────────────────
export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured.')
  }
  return new Stripe(key, { apiVersion: '2024-11-20' })
}

// ── Price ID map ────────────────────────────────────────────
// Maps plan names to Stripe Price IDs.
// Set these in your environment variables.
export const STRIPE_PRICES: Record<string, string> = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ?? '',
  pro_yearly:  process.env.STRIPE_PRICE_PRO_YEARLY  ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY  ?? '',
}

// ── Customer operations ─────────────────────────────────────

/**
 * Creates a Stripe customer for a new subscriber.
 * Called before creating a checkout session.
 */
export async function createStripeCustomer(
  email:    string,
  fullName: string | null,
  userId:   string
): Promise<Stripe.Customer> {
  const stripe = getStripeClient()

  return stripe.customers.create({
    email,
    name:     fullName ?? undefined,
    metadata: { supabase_user_id: userId },
  })
}

/**
 * Retrieves or creates a Stripe customer for a user.
 * Idempotent — safe to call multiple times.
 */
export async function getOrCreateStripeCustomer(
  email:              string,
  fullName:           string | null,
  userId:             string,
  existingCustomerId: string | null
): Promise<string> {
  const stripe = getStripeClient()

  if (existingCustomerId) {
    // Verify the customer still exists
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId)
      if (!customer.deleted) return existingCustomerId
    } catch {
      // Customer not found — create a new one below
    }
  }

  const customer = await createStripeCustomer(email, fullName, userId)
  return customer.id
}

// ── Checkout session ────────────────────────────────────────

export interface CreateCheckoutParams {
  customerId:  string
  priceId:     string
  userId:      string
  email:       string
  successUrl:  string
  cancelUrl:   string
}

/**
 * Creates a Stripe Checkout Session for subscription purchase.
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient()

  return stripe.checkout.sessions.create({
    customer:    params.customerId,
    mode:        'subscription',
    line_items:  [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url:  params.cancelUrl,
    metadata:    { supabase_user_id: params.userId },
    subscription_data: {
      metadata: { supabase_user_id: params.userId },
      trial_period_days: 14,
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  })
}

// ── Customer portal ─────────────────────────────────────────

/**
 * Creates a Stripe Customer Portal session for subscription management.
 * Allows users to cancel, upgrade, update payment methods.
 */
export async function createPortalSession(
  customerId:  string,
  returnUrl:   string
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripeClient()

  return stripe.billingPortal.sessions.create({
    customer:   customerId,
    return_url: returnUrl,
  })
}

// ── Webhook verification ────────────────────────────────────

/**
 * Verifies a Stripe webhook signature and constructs the event.
 * Throws if the signature is invalid.
 */
export function constructWebhookEvent(
  payload:   Buffer | string,
  signature: string
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured.')
  }

  const stripe = getStripeClient()
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

// ── Subscription helpers ────────────────────────────────────

/**
 * Maps a Stripe subscription to our internal plan name.
 */
export function mapStripePlanName(priceId: string): 'free' | 'pro' | 'enterprise' {
  if (priceId === STRIPE_PRICES.pro_monthly || priceId === STRIPE_PRICES.pro_yearly) {
    return 'pro'
  }
  return 'free'
}

/**
 * Maps a Stripe subscription status to our internal status.
 */
export function mapStripeStatus(
  status: Stripe.Subscription.Status
): 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid' {
  const statusMap: Record<Stripe.Subscription.Status, 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid'> = {
    active:              'active',
    trialing:            'trialing',
    past_due:            'past_due',
    canceled:            'canceled',
    incomplete:          'incomplete',
    incomplete_expired:  'incomplete_expired',
    unpaid:              'unpaid',
    paused:              'past_due',
  }
  return statusMap[status] ?? 'canceled'
}
