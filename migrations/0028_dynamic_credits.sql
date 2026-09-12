-- Dynamic credit spending: one generic spend/refund pair that takes the amount
-- from the application's pricing module instead of a constant baked into SQL.
-- Run once via scripts/run-migration.sh before variable-priced work is used.

begin;

create or replace function public.spend_credits_for(amount integer, spend_reason text)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if amount is null or amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  if spend_reason is null or length(trim(spend_reason)) = 0 then
    raise exception 'invalid_reason';
  end if;
  if (select is_restricted from profiles where id = auth.uid()) then
    raise exception 'account_restricted';
  end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  if credit_balance() < amount then
    raise exception 'insufficient_credits';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (auth.uid(), -amount, spend_reason);
  return credit_balance();
end;
$$;

create or replace function public.refund_credits_for(amount integer, refund_reason text)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  spent_total integer;
  refunded_total integer;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if amount is null or amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  select coalesce(sum(-delta), 0) into spent_total from credit_ledger
    where user_id = auth.uid() and reason = refund_reason and delta < 0;
  select coalesce(sum(delta), 0) into refunded_total from credit_ledger
    where user_id = auth.uid() and reason = refund_reason || '_refund' and delta > 0;
  if refunded_total + amount > spent_total then
    raise exception 'nothing_to_refund';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (auth.uid(), amount, refund_reason || '_refund');
  return credit_balance();
end;
$$;

commit;
