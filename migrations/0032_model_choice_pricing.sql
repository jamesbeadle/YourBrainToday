-- 0032: model choice and usage-priced questions.
-- Users pick the Claude model their own questions run on (a slider from
-- Haiku to Fable) — an admin pin from 0030 still wins. Chatbots carry a
-- model of their own and each member may be overridden. Questions now
-- reserve the model tier's floor and settle to the marked-up bill after the
-- answer; settle_chatbot_question is the pool-side counterpart of the
-- session-side spend_credits_for usage surcharge. See docs/model-pricing.md.

begin;

create table public.user_model_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  model_id text not null,
  updated_at timestamptz not null default now()
);

alter table public.user_model_preferences enable row level security;

create policy "Users manage their own model preference" on public.user_model_preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.chatbots
  add column model_id text not null default 'claude-haiku-4-5';

-- A settled bill may briefly take a pool below zero; the next top-up clears
-- it and the bot stops answering as soon as it cannot cover a floor.
alter table public.chatbots drop constraint if exists chatbots_pool_credits_check;

alter table public.chatbot_members
  add column model_id text;

-- Settlement must never fail, or the floor becomes the real price for
-- anyone who keeps a balance near it. This debits a user's ledger without
-- the balance check (the balance may go negative until their next pack)
-- and is callable only by the server, which names the payer.
create or replace function public.settle_credits_for(
  payer uuid,
  credit_amount integer,
  settle_reason text
)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if payer is null then
    raise exception 'unknown_payer';
  end if;
  if credit_amount is null or credit_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  perform pg_advisory_xact_lock(hashtext(payer::text));
  insert into credit_ledger (user_id, delta, reason)
  values (payer, -credit_amount, settle_reason);
  return (select coalesce(sum(delta), 0) from credit_ledger where user_id = payer);
end;
$$;

revoke execute on function public.settle_credits_for(uuid, integer, text)
  from public, anon, authenticated;
grant execute on function public.settle_credits_for(uuid, integer, text) to service_role;

-- Takes the settlement a finished question still owes from the pool and
-- onto the member's counter. The allowance is not re-checked (James: a
-- member may run over their allocation) and neither is the pool — the
-- answer already exists and the bill is real; the pool simply goes
-- negative until the owner tops up.
create or replace function public.settle_chatbot_question(
  target_chatbot uuid,
  member uuid,
  credit_amount integer
)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if credit_amount is null or credit_amount <= 0 then
    return 0;
  end if;
  perform pg_advisory_xact_lock(hashtext(target_chatbot::text));
  update chatbot_members
    set spent_credits = spent_credits + credit_amount
    where chatbot_id = target_chatbot and member_id = member;
  if not found then
    return 0;
  end if;
  update chatbots set pool_credits = pool_credits - credit_amount where id = target_chatbot;
  return credit_amount;
end;
$$;

revoke execute on function public.settle_chatbot_question(uuid, uuid, integer)
  from public, anon, authenticated;
grant execute on function public.settle_chatbot_question(uuid, uuid, integer) to service_role;

commit;
