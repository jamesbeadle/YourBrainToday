-- Source removal — deleting a document can now unlearn it from the model.
-- Widens brain_events.kind with the removal events and adds the unlearn
-- credit functions, mirroring spend_for_brain_ingest / refund_for_brain_ingest.

begin;

alter table public.brain_events drop constraint brain_events_kind_check;
alter table public.brain_events add constraint brain_events_kind_check check (
  kind in (
    'source_ingested',
    'source_removed',
    'context_created',
    'context_updated',
    'context_deleted',
    'page_created',
    'page_updated',
    'page_deleted',
    'question_answered',
    'brain_exported'
  )
);

create or replace function public.spend_for_brain_unlearn(source_identifier uuid)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  credits_per_unlearn constant integer := 50;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if (select is_restricted from profiles where id = auth.uid()) then
    raise exception 'account_restricted';
  end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  if not exists (select 1 from brain_sources where id = source_identifier and user_id = auth.uid()) then
    raise exception 'unknown_source';
  end if;
  if credit_balance() < credits_per_unlearn then
    raise exception 'insufficient_credits';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (auth.uid(), -credits_per_unlearn, 'brain_unlearn');
  return credit_balance();
end;
$$;

create or replace function public.refund_for_brain_unlearn()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  credits_per_unlearn constant integer := 50;
  spent_count integer;
  refunded_count integer;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  select count(*) into spent_count from credit_ledger
  where user_id = auth.uid() and reason = 'brain_unlearn';
  select count(*) into refunded_count from credit_ledger
  where user_id = auth.uid() and reason = 'brain_unlearn_refund';
  if refunded_count >= spent_count then
    raise exception 'nothing_to_refund';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (auth.uid(), credits_per_unlearn, 'brain_unlearn_refund');
  return credit_balance();
end;
$$;

commit;
