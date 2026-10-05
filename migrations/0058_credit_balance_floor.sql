-- 0058: a credit balance never goes below zero.
--
-- settle_credits_for (0032) debited the ledger with no balance check, so a
-- bill larger than the reserve took the balance negative; James saw -305
-- in the header and ruled it a bug (2026-10-05). A settlement now takes
-- only what the balance can cover and reports how much it took, so the
-- caller records the shortfall as margin lost rather than as a debt the
-- user owes. Balances already below zero are written back up to zero.

begin;

drop function if exists public.settle_credits_for(uuid, integer, text);

create function public.settle_credits_for(
  payer uuid,
  credit_amount integer,
  settle_reason text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  balance integer;
  taken integer;
begin
  if payer is null then
    raise exception 'unknown_payer';
  end if;
  if credit_amount is null or credit_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  if settle_reason is null or length(trim(settle_reason)) = 0 then
    raise exception 'invalid_reason';
  end if;
  perform pg_advisory_xact_lock(hashtext(payer::text));
  select coalesce(sum(delta), 0) into balance from credit_ledger where user_id = payer;
  taken := least(credit_amount, greatest(balance, 0));
  if taken > 0 then
    insert into credit_ledger (user_id, delta, reason)
    values (payer, -taken, settle_reason);
    balance := balance - taken;
  end if;
  return jsonb_build_object('creditsTaken', taken, 'creditBalance', balance);
end;
$$;

revoke execute on function public.settle_credits_for(uuid, integer, text)
  from public, anon, authenticated;
grant execute on function public.settle_credits_for(uuid, integer, text) to service_role;

insert into credit_ledger (user_id, delta, reason)
select user_id, -sum(delta), 'negative_balance_written_off'
  from credit_ledger
  group by user_id
  having sum(delta) < 0;

commit;
