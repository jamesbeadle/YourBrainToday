-- 0031: knowledge-base chatbots — a named front door onto a knowledge base
-- that its owner hands to people who may ask the knowledge but never open it.
-- The owner funds a bot from their own credits (one ledger debit per top-up,
-- reason chatbot_top_up) and at each top-up confirms how much of the pool
-- every member may spend; allowances and spent counters reset per top-up.
-- A question moves 10 credits out of the pool and onto the member's counter
-- under one lock — no ledger row, the owner already paid. See
-- docs/chatbot-architecture.md.

begin;

create table public.chatbots (
  id uuid primary key default gen_random_uuid(),
  knowledge_base_id uuid not null references public.knowledge_bases (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  pool_credits integer not null default 0 check (pool_credits >= 0),
  is_paused boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chatbot_members (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references public.chatbots (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  invited_email text not null,
  member_id uuid references auth.users (id) on delete set null,
  allowance_credits integer not null default 0 check (allowance_credits >= 0),
  spent_credits integer not null default 0 check (spent_credits >= 0),
  joined_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index chatbot_members_one_per_email
  on public.chatbot_members (chatbot_id, lower(invited_email));
create index chatbot_members_by_member on public.chatbot_members (member_id);

create table public.chatbot_top_ups (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references public.chatbots (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  credits integer not null check (credits > 0),
  created_at timestamptz not null default now()
);

create table public.chatbot_conversations (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references public.chatbots (id) on delete cascade,
  member_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table public.chatbot_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chatbot_conversations (id) on delete cascade,
  speaker text not null check (speaker in ('member', 'bot')),
  body text not null,
  cited_page_keys text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index chatbots_by_knowledge_base on public.chatbots (knowledge_base_id, created_at);
create index chatbot_top_ups_by_chatbot on public.chatbot_top_ups (chatbot_id, created_at desc);
create index chatbot_conversations_by_member on public.chatbot_conversations (chatbot_id, member_id);
create index chatbot_messages_by_conversation on public.chatbot_messages (conversation_id, created_at);

alter table public.chatbots enable row level security;
alter table public.chatbot_members enable row level security;
alter table public.chatbot_top_ups enable row level security;
alter table public.chatbot_conversations enable row level security;
alter table public.chatbot_messages enable row level security;

create or replace function public.is_chatbot_member(target_chatbot uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from chatbot_members
    where chatbot_id = target_chatbot and member_id = auth.uid()
  );
$$;

create or replace function public.is_chatbot_owner(target_chatbot uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from chatbots where id = target_chatbot and owner_id = auth.uid()
  );
$$;

-- Insert checks name the parent as well as the owner column: a bot must sit
-- on the caller's own knowledge base, a member or top-up on the caller's own
-- bot — otherwise anyone could hang a bot (and, through it, service-role
-- brain reads) on somebody else's knowledge base.
create policy "Owners manage their chatbots" on public.chatbots
  for all using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and exists (
      select 1 from knowledge_bases
      where id = knowledge_base_id and owner_id = auth.uid()
    )
  );
create policy "Members read their chatbots" on public.chatbots
  for select using (public.is_chatbot_member(id));

create policy "Owners manage chatbot members" on public.chatbot_members
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.is_chatbot_owner(chatbot_id));
create policy "Members read their own membership" on public.chatbot_members
  for select using (member_id = auth.uid());

create policy "Owners manage chatbot top ups" on public.chatbot_top_ups
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.is_chatbot_owner(chatbot_id));

create policy "Members manage their conversations" on public.chatbot_conversations
  for all using (member_id = auth.uid())
  with check (member_id = auth.uid() and public.is_chatbot_member(chatbot_id));

create policy "Members read their messages" on public.chatbot_messages
  for select using (
    exists (select 1 from chatbot_conversations
            where id = conversation_id and member_id = auth.uid())
  );

-- Claims the membership row whose invited email matches the signed-in
-- profile. The invite link is the acceptance, so there is no decline path.
create or replace function public.join_chatbot(target_chatbot uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  caller_email text;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  select lower(email) into caller_email from profiles where id = auth.uid();
  update chatbot_members
    set member_id = auth.uid(), joined_at = coalesce(joined_at, now())
    where chatbot_id = target_chatbot
      and lower(invited_email) = caller_email
      and (member_id is null or member_id = auth.uid());
  if not found then
    raise exception 'not_invited';
  end if;
end;
$$;

-- One owner debit funds the pool; every member's period restarts with the
-- allowances confirmed in member_allowances ([{"memberId": uuid, "allowance": int}]).
create or replace function public.top_up_chatbot(
  target_chatbot uuid,
  credit_amount integer,
  member_allowances jsonb
)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  allowance record;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if credit_amount is null or credit_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  if not exists (select 1 from chatbots where id = target_chatbot and owner_id = auth.uid()) then
    raise exception 'not_chatbot_owner';
  end if;
  if (select is_restricted from profiles where id = auth.uid()) then
    raise exception 'account_restricted';
  end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  perform pg_advisory_xact_lock(hashtext(target_chatbot::text));
  if credit_balance() < credit_amount then
    raise exception 'insufficient_credits';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (auth.uid(), -credit_amount, 'chatbot_top_up');
  insert into chatbot_top_ups (chatbot_id, credits) values (target_chatbot, credit_amount);
  update chatbots
    set pool_credits = pool_credits + credit_amount, updated_at = now()
    where id = target_chatbot;
  update chatbot_members set spent_credits = 0 where chatbot_id = target_chatbot;
  for allowance in
    select (item ->> 'memberId')::uuid as member_row_id,
           greatest(0, coalesce((item ->> 'allowance')::integer, 0)) as credits
    from jsonb_array_elements(coalesce(member_allowances, '[]'::jsonb)) as item
    where (item ->> 'memberId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  loop
    update chatbot_members
      set allowance_credits = allowance.credits
      where id = allowance.member_row_id and chatbot_id = target_chatbot;
  end loop;
  return (select pool_credits from chatbots where id = target_chatbot);
end;
$$;

-- Called by the ask endpoint through the service role — never by a member
-- directly, so the price and the member come from the server, not the
-- browser. Returns the member's remaining allowance. Errors are distinct so
-- the bot can tell the member whether it is their allowance or the bot's
-- pool that is exhausted.
create or replace function public.spend_for_chatbot_question(
  target_chatbot uuid,
  member uuid,
  credit_amount integer
)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  bot record;
  membership record;
begin
  if member is null then
    raise exception 'not_a_member';
  end if;
  if credit_amount is null or credit_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  perform pg_advisory_xact_lock(hashtext(target_chatbot::text));
  select id, pool_credits, is_paused into bot from chatbots where id = target_chatbot;
  if not found then
    raise exception 'unknown_chatbot';
  end if;
  select id, allowance_credits, spent_credits into membership from chatbot_members
    where chatbot_id = target_chatbot and member_id = member;
  if not found then
    raise exception 'not_a_member';
  end if;
  if bot.is_paused then
    raise exception 'chatbot_paused';
  end if;
  if bot.pool_credits < credit_amount then
    raise exception 'chatbot_out_of_credits';
  end if;
  if membership.spent_credits + credit_amount > membership.allowance_credits then
    raise exception 'allowance_exhausted';
  end if;
  update chatbots set pool_credits = pool_credits - credit_amount where id = target_chatbot;
  update chatbot_members
    set spent_credits = spent_credits + credit_amount
    where id = membership.id;
  return membership.allowance_credits - membership.spent_credits - credit_amount;
end;
$$;

create or replace function public.refund_for_chatbot_question(
  target_chatbot uuid,
  member uuid,
  credit_amount integer
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if credit_amount is null or credit_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  perform pg_advisory_xact_lock(hashtext(target_chatbot::text));
  update chatbot_members
    set spent_credits = greatest(0, spent_credits - credit_amount)
    where chatbot_id = target_chatbot and member_id = member;
  if not found then
    raise exception 'not_a_member';
  end if;
  update chatbots set pool_credits = pool_credits + credit_amount where id = target_chatbot;
end;
$$;

revoke execute on function public.spend_for_chatbot_question(uuid, uuid, integer)
  from public, anon, authenticated;
grant execute on function public.spend_for_chatbot_question(uuid, uuid, integer) to service_role;
revoke execute on function public.refund_for_chatbot_question(uuid, uuid, integer)
  from public, anon, authenticated;
grant execute on function public.refund_for_chatbot_question(uuid, uuid, integer) to service_role;

commit;
