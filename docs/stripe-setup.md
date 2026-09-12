# Stripe Setup Guide

How the implemented checkout works, the keys it needs, and the unit economics that make
the credit model profitable.

## How checkout works

- `src/routes/account/credits/+page.server.ts` — the `buy` action creates a Stripe
  Checkout session (`createCheckoutSession`) with the pack priced inline from
  `credit_packs`, `client_reference_id` set to the user id, and the pack id in metadata.
  The browser is redirected to Stripe and back to
  `/account/credits?checkout=success&session_id={CHECKOUT_SESSION_ID}` (or
  `?checkout=cancelled`).
- On return, `reconcileCheckoutReturn` retrieves the session, and if it is paid and its
  `client_reference_id` is the signed-in user, credits it through the same
  `complete_stripe_purchase` path as the webhook. The page then shows credited, pending
  (a bank payment not yet settled, or Stripe unreachable) or cancelled.
- `src/routes/api/stripe-webhook/+server.ts` — verifies the webhook signature and hands
  the event to `handleStripeEvent`:
  - `checkout.session.completed` and `checkout.session.async_payment_succeeded` credit
    the pack when `payment_status` is `paid`, through `complete_stripe_purchase`
    (service-role only, idempotent on the session id — so a success-page fulfilment and
    the webhook never double-credit).
  - `checkout.session.async_payment_failed` and `checkout.session.expired` are logged.
  - `charge.refunded` on a fully refunded charge looks up the checkout session by the
    charge's payment intent and calls `reverse_purchase_credits`, which stamps
    `purchases.refunded_at` once and debits the pack's credits (migration 0047). Partial
    refunds are logged and left to an admin adjustment — see `docs/admin-runbook.md`.

## Going live, step by step

1. **Create the Stripe account** at dashboard.stripe.com — a UK Stripe account, GBP as the
   default currency. Complete business verification early; payouts are blocked until done.
2. **Set the keys** in `.env` (and your host's environment): `STRIPE_SECRET_KEY`
   (starts `sk_live_` / `sk_test_`), `STRIPE_WEBHOOK_SECRET` (from step 3), and
   `SUPABASE_SECRET_KEY` (Supabase dashboard → Settings → API keys → secret key), which
   the webhook uses to credit the ledger.
3. **Register the webhook** in the Stripe dashboard: endpoint
   `https://<production-domain>/api/stripe-webhook`, events
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `checkout.session.expired` and
   `charge.refunded`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. **Apply migration 0047** (`scripts/run-migration.sh`) so `purchases.refunded_at`,
   `reverse_purchase_credits` and `admin_adjust_credits` exist before the first refund.
5. **Test locally** with the Stripe CLI: `stripe listen --forward-to
   localhost:5173/api/stripe-webhook` (use the CLI's signing secret), then pay with card
   `4242 4242 4242 4242`, and refund the payment from the test dashboard to see the
   credits reversed.
6. **Set the public face of the charge** in Stripe → Settings → Business (or Public
   details): the business name customers see, and a statement descriptor that reads as
   Your Brain Today on a bank statement — an unrecognised descriptor is the commonest
   cause of a chargeback.
7. **Turn receipt emails on** — Stripe → Settings → Customer emails → successful payments
   and refunds — so every purchase and refund has a receipt the app does not need to send.
8. **Point Stripe at the terms and privacy pages** — Stripe → Settings → Public details →
   terms of service and privacy policy URLs (`/terms` and `/privacy`), which Checkout links
   to and which Stripe's own risk review looks for.
9. **Flip to live keys** once test-mode purchases credit the ledger correctly.
10. **Make one real £2.99 purchase after deploying** — a Starter pack from a real card on
    the live site — and check that it appears on `/admin`, credits the ledger, and that a
    refund from the dashboard reverses it. Nothing else proves the live keys, the webhook
    secret and the service key are all the right ones.

No Stripe Products need to be created — packs are priced inline from the database, so
`credit_packs` stays the single source of truth.

## Unit economics — why 10 credits per reply is profitable

Cost side, per agent reply (Claude Sonnet, current API pricing ~$3/M input, $15/M output):

| Assumption | Tokens | Cost |
| --- | --- | --- |
| System prompt + map model + conversation in | ~4,000 | ~$0.012 |
| Reply + full map model out | ~1,500 | ~$0.023 |
| **Total per reply** | | **~$0.035 (~3p)** |

Revenue side, per reply, at 10 credits per reply:

| Pack | Price | Credits | Per reply | Margin per reply |
| --- | --- | --- | --- | --- |
| Starter (500) | £2.99 | 500 | 6.0p | ~3p (50%) |
| Growth (1,200) | £5.99 | 1,200 | 5.0p | ~2p (40%) |
| Scale (3,000) | £12.99 | 3,000 | 4.3p | ~1.3p (31%) |

Stripe fees (1.5% + 20p UK cards) cost 24.5p on a Starter pack — about 8.2% of revenue.
The fixed 20p is why packs never go below ~£3: at £1.99 the fee share is 11.6%.

Two cost reductions are planned before launch, and the Scale pack's thinner margin
assumes at least one lands:

- **Emit map diffs, not the full map** — output is 65% of the cost because the whole map
  model is re-emitted every reply. Diffs cut cost per reply to roughly half.
- **Prompt caching** — the system prompt and transcript are identical prefixes each turn;
  cached input reads cost ~10% of fresh input. Together these take a reply from ~3p to
  ~1p, lifting every margin above 75%.

The margin's biggest sensitivity is conversation length: the whole transcript is resent
each reply, so input cost grows with long conversations. If margins tighten, cap the
resent history (last ~30 turns plus the map model, which already summarises the rest)
before raising prices.

## Watch items before launch

Move `agent_messages` pruning/archival onto a schedule if conversations get very long;
add a Stripe customer id column to `profiles` when you want saved cards; and remove the
`demo@ybt.dev` seeded account before real marketing traffic arrives.
