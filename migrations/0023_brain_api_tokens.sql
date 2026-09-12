-- 0023: brain API access — personal access tokens that let a brain's owner
-- use their domain brain from outside the site (scripts, agents, Claude).
-- A token belongs to one brain and one owner; only its SHA-256 hash is
-- stored. API questions spend the owner's credits through service-role-only
-- functions that mirror the spend/refund idiom of 0012/0018, under the
-- distinct ledger reasons brain_api_question / brain_api_question_refund.

begin;

create table public.brain_api_tokens (
  id uuid primary key default gen_random_uuid(),
  brain_id uuid not null references public.domain_brains (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  token_hash text not null unique,
  token_hint text not null default '',
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index brain_api_tokens_brain on public.brain_api_tokens (brain_id);

alter table public.brain_api_tokens enable row level security;

create policy brain_api_tokens_select on public.brain_api_tokens
  for select using (owner_id = auth.uid());

create policy brain_api_tokens_insert on public.brain_api_tokens
  for insert with check (
    owner_id = auth.uid()
    and exists (
      select 1 from public.domain_brains
      where id = brain_id and owner_id = auth.uid()
    )
  );

create policy brain_api_tokens_update on public.brain_api_tokens
  for update using (owner_id = auth.uid());

-- API writes run as the service role, where auth.uid() is null, so the code
-- supplies owner_id explicitly on conversations and messages (0006 schema).
-- brain_events predates the repo migrations and its owner column is not
-- pinned down, so normalise it here instead of in code: if the table carries
-- an owner-ish column, a trigger fills a null one from the brain's owner —
-- session inserts keep their auth.uid() default, service inserts get the
-- brain owner. If no such column exists, nothing is needed.
do $$
declare
  owner_column text;
begin
  select column_name into owner_column from information_schema.columns
  where table_schema = 'public' and table_name = 'brain_events'
    and column_name in ('owner_id', 'user_id')
  limit 1;
  if owner_column is null then
    return;
  end if;
  execute format($function$
    create or replace function public.fill_brain_event_owner()
    returns trigger
    language plpgsql
    security definer
    set search_path to 'public'
    as $body$
    begin
      if new.%1$I is null then
        select owner_id into new.%1$I from domain_brains where id = new.brain_id;
      end if;
      return new;
    end;
    $body$;
  $function$, owner_column);
  execute 'drop trigger if exists brain_events_fill_owner on public.brain_events';
  execute 'create trigger brain_events_fill_owner before insert on public.brain_events
    for each row execute function public.fill_brain_event_owner()';
end $$;

-- API conversations sit alongside the terminal and face channels.
alter table public.brain_conversations drop constraint brain_conversations_channel_check;
alter table public.brain_conversations add constraint brain_conversations_channel_check
  check (channel in ('brain', 'face', 'api'));

-- Spend the token owner's credits for one API question. There is no signed-in
-- user on an API call, so the caller (the service role only) presents the
-- token hash and the function charges the owner it resolves to.
create or replace function public.spend_for_brain_api_question(p_token_hash text)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  credits_per_question constant integer := 10;
  token_owner uuid;
  owner_balance integer;
begin
  select owner_id into token_owner from brain_api_tokens
  where token_hash = p_token_hash and revoked_at is null;
  if token_owner is null then
    raise exception 'unknown_token';
  end if;
  if (select is_restricted from profiles where id = token_owner) then
    raise exception 'account_restricted';
  end if;
  perform pg_advisory_xact_lock(hashtext(token_owner::text));
  select coalesce(sum(delta), 0) into owner_balance from credit_ledger
  where user_id = token_owner;
  if owner_balance < credits_per_question then
    raise exception 'insufficient_credits';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (token_owner, -credits_per_question, 'brain_api_question');
  return owner_balance - credits_per_question;
end;
$$;

create or replace function public.refund_for_brain_api_question(p_token_hash text)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  credits_per_question constant integer := 10;
  token_owner uuid;
  spent_count integer;
  refunded_count integer;
begin
  select owner_id into token_owner from brain_api_tokens
  where token_hash = p_token_hash;
  if token_owner is null then
    raise exception 'unknown_token';
  end if;
  perform pg_advisory_xact_lock(hashtext(token_owner::text));
  select count(*) into spent_count from credit_ledger
  where user_id = token_owner and reason = 'brain_api_question';
  select count(*) into refunded_count from credit_ledger
  where user_id = token_owner and reason = 'brain_api_question_refund';
  if refunded_count >= spent_count then
    raise exception 'nothing_to_refund';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (token_owner, credits_per_question, 'brain_api_question_refund');
  return (select coalesce(sum(delta), 0) from credit_ledger where user_id = token_owner);
end;
$$;

-- Only the server's service role may move credits through these.
revoke execute on function public.spend_for_brain_api_question(text) from public;
revoke execute on function public.spend_for_brain_api_question(text) from anon;
revoke execute on function public.spend_for_brain_api_question(text) from authenticated;
revoke execute on function public.refund_for_brain_api_question(text) from public;
revoke execute on function public.refund_for_brain_api_question(text) from anon;
revoke execute on function public.refund_for_brain_api_question(text) from authenticated;
grant execute on function public.spend_for_brain_api_question(text) to service_role;
grant execute on function public.refund_for_brain_api_question(text) to service_role;

commit;
