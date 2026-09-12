-- Prune knowledge — the Modeller can now audit and tidy the model on demand.
-- Adds the prune credit functions (25 credits, mirroring the question idiom)
-- and widens brain_events.kind with 'model_pruned'.
-- Run in the Supabase SQL editor.

begin;

alter table public.brain_events drop constraint brain_events_kind_check;
alter table public.brain_events add constraint brain_events_kind_check check (
  kind in (
    'source_ingested', 'source_removed',
    'context_created', 'context_updated', 'context_deleted',
    'page_created', 'page_updated', 'page_deleted',
    'question_answered', 'brain_exported',
    'changes_proposed', 'changes_approved', 'changes_rejected',
    'edition_published',
    'model_pruned'
  )
);

create or replace function public.spend_for_brain_prune()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  credits_per_prune constant integer := 25;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if (select is_restricted from profiles where id = auth.uid()) then
    raise exception 'account_restricted';
  end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  if credit_balance() < credits_per_prune then
    raise exception 'insufficient_credits';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (auth.uid(), -credits_per_prune, 'brain_prune');
  return credit_balance();
end;
$$;

create or replace function public.refund_for_brain_prune()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  credits_per_prune constant integer := 25;
  spent_count integer;
  refunded_count integer;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  select count(*) into spent_count from credit_ledger
  where user_id = auth.uid() and reason = 'brain_prune';
  select count(*) into refunded_count from credit_ledger
  where user_id = auth.uid() and reason = 'brain_prune_refund';
  if refunded_count >= spent_count then
    raise exception 'nothing_to_refund';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (auth.uid(), credits_per_prune, 'brain_prune_refund');
  return credit_balance();
end;
$$;

commit;
