---
name: stripe
description: Integrate Stripe payments into factory projects. Covers setup, products and prices, Checkout Sessions, webhooks, subscriptions, customer portal, and security. Use when adding payments, billing, or subscriptions to any project.
---

# Stripe (Factory Reference)

## Setup

```bash
npm install stripe @stripe/stripe-js
```

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...   # client-safe
STRIPE_SECRET_KEY=sk_live_...                     # server-only, never expose
STRIPE_WEBHOOK_SECRET=whsec_...                   # from `stripe listen` or dashboard
```

**Never expose `STRIPE_SECRET_KEY` to the client.** All Stripe API calls using the secret key must be in server-side code (API routes, Server Actions, Edge Functions).

## One-Time Payment (Checkout Session)

```ts
// app/api/checkout/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { priceId } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId: 'user_123' },  // pass context through
  })

  return Response.json({ url: session.url })
}
```

```ts
// Client — redirect to Stripe Checkout
const res = await fetch('/api/checkout', {
  method: 'POST',
  body: JSON.stringify({ priceId: 'price_xxx' })
})
const { url } = await res.json()
window.location.href = url
```

## Subscriptions

```ts
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',               // <-- key difference
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/pricing`,
  customer_email: user.email,         // pre-fill email
  client_reference_id: user.id,       // link to your user
  subscription_data: {
    trial_period_days: 14,            // optional trial
  },
})
```

## Customer Portal (self-service billing)

```ts
// app/api/portal/route.ts
export async function POST(req: Request) {
  const { customerId } = await req.json()

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  return Response.json({ url: session.url })
}
```

## Webhooks (critical — always verify signature)

```ts
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()  // raw text — NOT json()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      // Fulfill order, update DB
      await handleCheckoutComplete(session)
      break
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await handleSubscriptionChange(sub)
      break
    }
    case 'invoice.payment_failed': {
      // Email user, mark subscription past_due
      break
    }
  }

  return new Response('ok')
}
```

**Webhook config for Next.js:** Stripe sends raw body — must read as `req.text()`, not `req.json()`. Add to `next.config.js`:
```ts
// Not needed in App Router — raw body available by default
```

**Local webhook testing:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Prints STRIPE_WEBHOOK_SECRET for local use
```

## Key Webhook Events to Handle

| Event | Meaning |
|---|---|
| `checkout.session.completed` | Payment succeeded — fulfill |
| `customer.subscription.created` | New subscription started |
| `customer.subscription.updated` | Plan changed, trial ended |
| `customer.subscription.deleted` | Cancelled |
| `invoice.payment_succeeded` | Renewal paid |
| `invoice.payment_failed` | Renewal failed — notify user |

## Products + Prices (CLI)

```bash
# Create test products
stripe products create --name "Pro Plan"
stripe prices create --product prod_xxx --unit-amount 2900 --currency usd --recurring-interval month
```

## Storing Stripe Data

Always store in your DB:
- `stripe_customer_id` on user record
- `stripe_subscription_id` + `status` + `price_id` on subscription record
- Update via webhooks, not just checkout success (webhooks are the source of truth)

## Test Cards

| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0025 0000 3155` | Requires 3DS |
| Any future expiry, any CVC |  |

## Common Mistakes

- Reading webhook body as JSON → signature verification fails. Always use `req.text()`.
- Trusting checkout `success_url` redirect as fulfillment → user can hit success URL without paying. Always fulfill in webhook.
- Not idempotency-checking webhooks → Stripe retries on failure, can double-fulfill. Check event ID before processing.
- Storing `price_id` without storing `stripe_customer_id` → can't use customer portal later.
