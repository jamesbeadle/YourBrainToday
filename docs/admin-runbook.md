# Admin Runbook

What an admin does day to day, where each control lives, and what to do when the
automatic path did not run. Every control on `/admin` is gated by `require_admin()` in the
database, so nothing here works from a non-admin account even with the URL.

Three places are referred to throughout:

- **`/admin`** — the admin page: site model, the users list with an Actions menu per
  account, and the purchases table.
- **The Stripe dashboard** — dashboard.stripe.com, in live mode.
- **The SQL editor** — Supabase dashboard → SQL Editor. It runs as the database owner, so
  it can call the service-role-only functions below. Anything typed there is real
  customer data; read the statement twice.

## Credits

### Adjust a balance

`/admin` → Actions → **Adjust credits…** on the account. Enter a positive number to add
credits or a negative number to take them away, and a note saying why — the note is
required and is written into the ledger as `admin_adjustment:<note>`, so it is what you
will read back later in `/admin/usage` or the ledger. The limit is 100,000 either way per
adjustment. The balance may go negative; the next pack clears it.

The page calls `admin_adjust_credits(target_email, credit_delta, note)`. It checks
`require_admin()` against the signed-in session, so it refuses the SQL editor, which has
no session. From the SQL editor, write the ledger row directly instead:

```sql
insert into credit_ledger (user_id, delta, reason)
select id, -500, 'admin_adjustment:goodwill' from profiles where email = 'someone@example.com';
```

`admin_grant_credits(target_email, credit_amount, note)` still exists and only adds
(`credit_amount` must be positive). The admin page no longer uses it; prefer
`admin_adjust_credits`, which covers both directions with one ledger reason.

### Restrict or unrestrict an account

`/admin` → Actions → **Restrict** (or **Unrestrict**). A restricted account keeps its
balance and can sign in, but cannot buy a pack and every credit spend refuses with
`account_restricted`. Use it for suspected abuse, a chargeback in progress, or an account
you are about to delete but cannot yet (see below).

### Make or remove staff

`/admin` → Actions → **Make staff** (or **Remove staff**). Staff see the project
management area and the staff dashboard, and their MCP tokens act as staff. Admins are
staff implicitly. Staff status does not touch credits.

## Delete an account

`/admin` → Actions → **Delete account**, confirm. This removes the `auth.users` row and,
through the cascades every owner table declares, all of the account's own data —
brains, knowledge bases, chatbots, ledger, purchases. It cannot be undone.

Two refusals, both reported on the page as "could not be deleted":

1. **Admin accounts** — `admin_delete_user` raises `cannot_delete_admin`. The Actions menu
   hides Delete for admins. To remove an admin, first clear the flag in the SQL editor:
   `update profiles set is_admin = false where email = '…';` then delete from `/admin`.
2. **Accounts that own team data** — `projects.created_by` and `tasks.created_by` reference
   the account with no cascade, so the delete fails rather than tearing the team's records
   down. Either hand the records to another staff member first —
   `update projects set created_by = '<staff uuid>' where created_by = '<target uuid>';`
   and the same for `tasks` — then delete; or, if the person only needs to be shut out,
   **Restrict** the account and leave it.

Personal data requests: the delete above is the deletion. Export before deleting if the
person asked for their data as well.

## Purchases and refunds

### How a purchase lands

Checkout redirects back to `/account/credits?checkout=success&session_id=…`. The page
retrieves the session from Stripe and, if it is paid and belongs to the signed-in user,
credits it at once; the `checkout.session.completed` webhook does the same thing moments
later. Both go through `complete_stripe_purchase`, which is idempotent on the session id,
so whichever runs second is a no-op. Bank payments arrive unpaid and are credited when
`checkout.session.async_payment_succeeded` arrives; until then the page says pending.

Every purchase is listed at the bottom of `/admin` with its session id, pack, credits,
amount, date and — once reversed — the refund date.

### Refund a purchase

1. Stripe dashboard → Payments → the payment → **Refund**. Refund the full amount.
2. Stripe sends `charge.refunded`; the webhook finds the checkout session for the charge
   and calls `reverse_purchase_credits(session id)`, which stamps `purchases.refunded_at`
   and writes `purchase_refund:<pack>` for minus the pack's credits. The balance may go
   negative — the credits were already spendable.
3. Check `/admin`: the purchase now shows a refund date and the balance has moved.

A **partial refund** does not reverse credits (the charge is not marked refunded). Use
**Adjust credits…** with a note such as `partial refund cs_…` for the share you refunded.

If step 3 shows nothing after a minute the webhook missed. Either replay it — Stripe
dashboard → Developers → Webhooks → the endpoint → the `charge.refunded` event →
**Resend** — or reverse it by hand in the SQL editor with the session id from `/admin`:

```sql
select reverse_purchase_credits('cs_live_…');
```

It returns the new balance and is safe to run twice: the second run changes nothing.

### Replay a missed checkout webhook

Symptom: a payment in Stripe with no matching row in `/admin`'s purchases table. In order
of preference:

1. Ask the customer to open their success link again, or open it for them:
   `/account/credits?checkout=success&session_id=cs_live_…` reconciles on load.
2. Stripe dashboard → Developers → Webhooks → the endpoint → the
   `checkout.session.completed` event → **Resend**.
3. SQL editor, with the user id, pack id and session id from the Stripe session:
   `select complete_stripe_purchase('<user uuid>', 'starter', 'cs_live_…');`

All three are idempotent on the session id.

## Migrations

### Apply a migration by hand

```sh
SUPABASE_DB_URL='postgresql://…' ./scripts/run-migration.sh migrations/0047_purchase_refunds_and_credit_adjustments.sql
```

The connection string is the Session pooler string from Supabase dashboard → Connect.
The script runs the file as one transaction and rolls the whole thing back on any error,
so a failed run leaves nothing half-applied.

### Confirm what is applied

Supabase's migration history (dashboard → Database → Migrations, or
`supabase_migrations.schema_migrations`) records only what went through Supabase's own
tooling. Files run through `run-migration.sh` never appear there. Confirm by asking the
schema, for example for 0047:

```sql
select column_name from information_schema.columns
where table_name = 'purchases' and column_name = 'refunded_at';

select proname from pg_proc
where proname in ('reverse_purchase_credits', 'admin_adjust_credits');
```

Every migration file is safe to re-run, so when in doubt, run it again.

As of 5 September 2026 every file up to 0048 is applied to production; 0040 and
0042–0048 went through Supabase's tooling and are in the history, 0041 was run by hand.

### Rebuild a database from nothing

The tables and functions that predate the numbered migrations — profiles, credit packs,
the ledger, purchases, the original agent and map storage, brain sources and events, the
admin gates and the signup trigger — live in `docs/sql/base-schema.sql`, captured from
production. Run that first, then `migrations/0001` onward in order.

## The admin test pack

`purchase_credit_pack('<pack id>')` grants a pack's credits with no payment, records a
purchase with an `admin_test_pack_…` session id, and writes `admin_test_pack:<pack>` to
the ledger. Since migration 0046 it refuses everyone but an admin. It exists to check the
credit flow end to end on a real account; it is not a way to give a customer credits —
use Adjust credits for that. It has no button: call it with a signed-in admin's Supabase
client — `supabase.rpc('purchase_credit_pack', { pack_identifier: 'starter' })` — and, like
`admin_adjust_credits`, it refuses the SQL editor. Real payments are tested with a real
£2.99 purchase and a refund from the Stripe dashboard.

## Reading /admin/usage

The window switch (7, 30, 90 days) scopes credit movements and Claude calls; balances are
all-time.

- **Claude cost** — what the model calls in the window cost at API prices.
- **Revenue at pack value** — the credits users net-spent in the window, valued at the
  cheapest pack's rate. It is what those credits were sold for at most, not cash taken.
- **Margin** — revenue minus cost; red when negative.
- **Settlement failures** — calls whose usage-priced settlement failed to debit. Any
  number above zero is a bug to chase in the logs.
- **By model** — cost and calls per Claude model, to see which tier is eating margin.
- **By user** — Bought (paid packs, net of reversed purchases), Granted (welcome, promo,
  gifts, earnings and admin adjustments either way), Spent, Refunded (spends handed back
  after a failed answer), all-time Balance, then cost, revenue and margin for the window.
  Sorted by cost, so the most expensive accounts are at the top.
