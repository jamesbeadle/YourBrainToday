-- Payout details for the Trade Talk revenue share — one row per user, holding
-- the UK bank account their cash payouts land in once Stripe payouts go live.
-- Run once via your usual migration flow.

begin;

create table public.payout_details (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  account_holder text not null default '',
  sort_code text not null default '',
  account_number text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.payout_details enable row level security;

create policy "Users manage their own payout details" on public.payout_details
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

commit;
