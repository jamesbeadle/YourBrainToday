-- 0042: every metered Claude call, stored at settlement.
-- requestAnthropic already meters each call's usage block into the request
-- context; until now nothing kept it. One row per call lands here when the
-- job settles (or refunds, or fails to settle), carrying the model, the
-- tokens, Anthropic's cost in pence and the share of the credits that were
-- actually charged — so /admin/usage can show cost against revenue per
-- user and per model, and a failed settlement shows as leakage instead of
-- vanishing into a log line. Written only by the server's service role;
-- readable by admins. See docs/model-pricing.md. Safe to re-run.

begin;

create table if not exists public.model_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reason text not null,
  chatbot_id uuid references public.chatbots (id) on delete set null,
  model_id text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  cache_read_tokens integer not null default 0 check (cache_read_tokens >= 0),
  cache_write_tokens integer not null default 0 check (cache_write_tokens >= 0),
  cost_pence numeric(10, 4) not null default 0 check (cost_pence >= 0),
  credits_charged integer not null default 0 check (credits_charged >= 0),
  has_failed_settlement boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists model_usage_by_user on public.model_usage (user_id, created_at desc);
create index if not exists model_usage_by_created on public.model_usage (created_at desc);

alter table public.model_usage enable row level security;

drop policy if exists "Admins read model usage" on public.model_usage;
create policy "Admins read model usage" on public.model_usage
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin
    )
  );

revoke all on table public.model_usage from public, anon, authenticated;
grant select on table public.model_usage to authenticated;
grant all on table public.model_usage to service_role;

commit;
