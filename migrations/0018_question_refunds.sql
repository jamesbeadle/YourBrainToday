-- A failed question refunds its credits, mirroring the ingest refund idiom.

begin;

create or replace function public.refund_for_brain_question()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  credits_per_question constant integer := 10;
  spent_count integer;
  refunded_count integer;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  select count(*) into spent_count from credit_ledger
  where user_id = auth.uid() and reason = 'brain_question';
  select count(*) into refunded_count from credit_ledger
  where user_id = auth.uid() and reason = 'brain_question_refund';
  if refunded_count >= spent_count then
    raise exception 'nothing_to_refund';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (auth.uid(), credits_per_question, 'brain_question_refund');
  return credit_balance();
end;
$$;

commit;
