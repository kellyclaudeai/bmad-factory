---
name: stripe
description: Integrate Stripe payments into factory projects. Covers per-project Stripe account setup, products and prices (subscriptions + one-time), Checkout Sessions, webhooks, customer portal, metered billing, payment descriptions/metadata, and security. Use when adding payments, billing, or subscriptions to any project.
---

# Stripe (Factory Reference)

## ⚠️ Per-Project Stripe Accounts (Factory Rule)

**Every factory project gets its own Stripe account.** Never share a Stripe account across projects.

**Why:** Clean revenue separation, separate payouts, separate tax reporting, separate dashboard per product.

### Creating a New Stripe Account

Each project uses a separate Stripe account under the factory email pattern:

```
Email: kelly+{projectId}@bloomtech.com
Business name: {Project Name}
```

**Setup flow:**
1. Go to https://dashboard.stripe.com — log out if needed, create new account
2. Or: use Stripe's "Create new account" from the account switcher (top-left dropdown)
3. Set business name = project name (e.g. "Distill", "ReelRolla")
4. Complete activation (bank account for payouts) — skip for test mode development
5. Get keys from Dashboard → Developers → API keys
6. Save secret key to Keychain: `security add-generic-password -a "kelly-{projectId}-stripe" -s "kelly-{projectId}-stripe-secret" -w "sk_live_..."`
7. Log account in `docs/core/factory-accounts.md`

**Stripe CLI login per project:**
```bash
stripe login --api-key sk_live_...   # or use STRIPE_SECRET_KEY env var inline
```

---

## Installation

```bash
pnpm add stripe @stripe/stripe-js
```

## Environment Variables

```env
# Server-only (never expose to client)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Product/price IDs (set after creating products below)
STRIPE_PRO_PRICE_ID=price_...
STRIPE_UNLIMITED_PRICE_ID=price_...

# Client-safe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Never expose `STRIPE_SECRET_KEY` to the client.** All calls using the secret key must be server-side (API routes, Server Actions, Edge Functions).

---

## Product + Price Setup (CLI — do this first)

Always create products via CLI, not dashboard clicking. Store price IDs in env vars.

```bash
# Create subscription products with clear names + descriptions
stripe products create \
  --name "Distill Pro" \
  --description "10 distills per day" \
  --metadata[product_type]=subscription \
  --metadata[project]=distill

stripe products create \
  --name "Distill Unlimited" \
  --description "Unlimited distills" \
  --metadata[product_type]=subscription \
  --metadata[project]=distill

# Create prices (monthly subscriptions)
stripe prices create \
  --product prod_ProXXX \
  --unit-amount 500 \
  --currency usd \
  --recurring[interval]=month \
  --nickname "Pro Monthly"

stripe prices create \
  --product prod_UnlimitedXXX \
  --unit-amount 1000 \
  --currency usd \
  --recurring[interval]=month \
  --nickname "Unlimited Monthly"

# List to get IDs for env vars
stripe products list
stripe prices list
```

**After creating:** Set `STRIPE_PRO_PRICE_ID` and `STRIPE_UNLIMITED_PRICE_ID` in Vercel immediately.

### Updating Product Descriptions
```bash
stripe products update prod_XXX \
  --description "New description" \
  --metadata[daily_limit]=10
```

---

## Subscriptions (Checkout Session)

```ts
// app/api/checkout/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { priceId, userId, userEmail } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
    customer_email: userEmail,          // pre-fill email field
    client_reference_id: userId,        // link checkout to your user ID
    subscription_data: {
      metadata: {
        userId,                         // available in webhook events
        project: 'distill',
      },
    },
    payment_method_collection: 'always',
    allow_promotion_codes: true,        // enable discount codes
  })

  return Response.json({ url: session.url })
}
```

## One-Time Payment

```ts
const session = await stripe.checkout.sessions.create({
  mode: 'payment',                      // <-- key difference
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/pricing`,
  metadata: { userId, project: 'myapp' },
})
```

## Customer Portal (self-service billing)

```ts
// app/api/billing-portal/route.ts
export async function POST(req: Request) {
  const user = await getCurrentUser()  // your auth helper
  
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,   // stored in your DB
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
  })

  return Response.json({ url: session.url })
}
```

---

## Webhooks (Critical — always verify signature)

```ts
// app/api/stripe/webhook/route.ts
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()          // ⚠️ raw text — NEVER req.json()
  const sig = (await headers()).get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  // Idempotency guard — Stripe retries on failure, don't double-process
  const eventId = event.id
  const alreadyProcessed = await db.query.webhookEvents.findFirst({ where: eq(webhookEvents.stripeEventId, eventId) })
  if (alreadyProcessed) return new Response('ok')

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === 'subscription') {
        await handleSubscriptionCreated(session)
      } else {
        await handleOneTimePayment(session)
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdate(sub)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await handleSubscriptionCancelled(sub)
      break
    }
    case 'invoice.payment_succeeded': {
      // Renewal paid — ensure access is active
      const invoice = event.data.object as Stripe.Invoice
      await handleRenewal(invoice)
      break
    }
    case 'invoice.payment_failed': {
      // Renewal failed — notify user, mark past_due
      const invoice = event.data.object as Stripe.Invoice
      await handlePaymentFailed(invoice)
      break
    }
  }

  // Log processed event
  await db.insert(webhookEvents).values({ stripeEventId: eventId, type: event.type, processedAt: new Date() })

  return new Response('ok')
}
```

### Key Webhook Events

| Event | Meaning | Action |
|---|---|---|
| `checkout.session.completed` | Payment succeeded | Fulfill — grant access, update DB |
| `customer.subscription.created` | New sub started | Redundant with checkout.completed — skip or use |
| `customer.subscription.updated` | Plan changed, trial ended | Update tier in DB |
| `customer.subscription.deleted` | Cancelled or expired | Revoke access, downgrade to free |
| `invoice.payment_succeeded` | Monthly renewal paid | Confirm continued access |
| `invoice.payment_failed` | Renewal failed | Notify user, set status=past_due |

### Webhook Setup

**Production (Vercel):**
```bash
# Register webhook endpoint in Stripe
stripe webhooks create \
  --url https://your-app.vercel.app/api/stripe/webhook \
  --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed

# Get the webhook secret
stripe webhooks list
# Copy whsec_... → set STRIPE_WEBHOOK_SECRET in Vercel
```

**Local dev:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Prints a local whsec_... — use as STRIPE_WEBHOOK_SECRET for local .env
```

---

## Database Schema (Drizzle)

Always store Stripe state in your DB — webhooks are the source of truth.

```ts
// schema.ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id'),     // set on first checkout
  stripePlan: text('stripe_plan').default('free'),  // 'free' | 'pro' | 'unlimited'
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeSubscriptionStatus: text('stripe_subscription_status'), // active | past_due | canceled
  stripePriceId: text('stripe_price_id'),
  stripeCurrentPeriodEnd: timestamp('stripe_current_period_end'),
})

export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  stripeEventId: text('stripe_event_id').notNull().unique(),  // idempotency key
  type: text('type').notNull(),
  processedAt: timestamp('processed_at').notNull(),
})
```

---

## Handling Subscription State

```ts
// lib/subscription.ts
export async function getUserPlan(userId: string): Promise<'free' | 'pro' | 'unlimited'> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  
  if (!user?.stripeSubscriptionId) return 'free'
  if (user.stripeSubscriptionStatus !== 'active') return 'free'
  
  if (user.stripePriceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  if (user.stripePriceId === process.env.STRIPE_UNLIMITED_PRICE_ID) return 'unlimited'
  
  return 'free'
}

export function getDailyLimit(plan: string): number {
  switch (plan) {
    case 'pro':       return 10
    case 'unlimited': return Infinity
    default:          return 1   // free
  }
}
```

---

## Test Cards

| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0025 0000 3155` | Requires 3DS auth |
| `4000 0000 0000 9995` | Insufficient funds |

Any future expiry, any CVC, any zip.

---

## Common Mistakes

- **`req.json()` in webhook handler** → signature verification fails. Always use `req.text()`.
- **Fulfilling on checkout redirect** → user can hit success URL without paying. Always fulfill in webhook, never on redirect.
- **No idempotency check** → Stripe retries on failure, can double-fulfill. Always check event ID before processing.
- **Not storing `stripe_customer_id`** → can't use customer portal or look up subscriptions later.
- **Constructing pooler host manually** → just use the connection string from Supabase dashboard directly.
- **Using live keys in dev** → use `pk_test_` / `sk_test_` for local dev, `pk_live_` / `sk_live_` for production.
- **Missing webhook events in registration** → register all 5 key events at setup time, not one-by-one.
- **Shared Stripe account across projects** → each project must have its own account.
