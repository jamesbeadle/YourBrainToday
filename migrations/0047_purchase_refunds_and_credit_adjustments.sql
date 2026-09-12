-- 0047: reverse a refunded purchase, and let an admin move a balance either way.
--
-- 1. reverse_purchase_credits takes a Stripe checkout session id, stamps the
--    purchase refunded_at once, and debits the credits the pack granted. The
--    webhook resolves a charge to its session by asking Stripe
--    (stripe.checkout.sessions.list({ payment_intent })) rather than storing a
--    payment intent id here: complete_stripe_purchase lives only in the live
--    database, so widening its signature would be a blind edit, and a payment
--    mode Checkout session has exactly one payment intent, so the lookup is
--    exact. The balance may go negative — the credits were already spendable.
-- 2. admin_adjust_credits is admin_grant_credits with a sign: a non-zero delta
--    within ±100,000 and a note, written to the ledger as admin_adjustment:<note>.
--    admin_grant_credits stays as it is.
--
-- Safe to re-run. Run through scripts/run-migration.sh or the Supabase
-- migration tooling; do not run by hand in pieces.

begin;

alter table public.purchases add column if not exists refunded_at timestamptz;

create or replace function public.reverse_purchase_credits(session_identifier text)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	purchase purchases%rowtype;
begin
	if session_identifier is null or length(trim(session_identifier)) = 0 then
		raise exception 'invalid_session';
	end if;
	select * into purchase from purchases
		where stripe_checkout_session_id = session_identifier
		for update;
	if not found then
		raise exception 'purchase_not_found';
	end if;
	perform pg_advisory_xact_lock(hashtext(purchase.user_id::text));
	if purchase.refunded_at is null then
		update purchases set refunded_at = now() where id = purchase.id;
		insert into credit_ledger (user_id, delta, reason)
		values (purchase.user_id, -purchase.credits, 'purchase_refund:' || purchase.pack_id);
	end if;
	return (select coalesce(sum(delta), 0) from credit_ledger where user_id = purchase.user_id);
end;
$$;

revoke execute on function public.reverse_purchase_credits(text)
	from public, anon, authenticated;
grant execute on function public.reverse_purchase_credits(text) to service_role;

create or replace function public.admin_adjust_credits(
	target_email text,
	credit_delta integer,
	note text
)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	target_id uuid;
	adjustment_limit constant integer := 100000;
begin
	perform require_admin();
	if credit_delta is null or credit_delta = 0 or abs(credit_delta) > adjustment_limit then
		raise exception 'invalid_amount';
	end if;
	if note is null or length(trim(note)) = 0 then
		raise exception 'invalid_note';
	end if;
	select id into target_id from profiles where email = target_email;
	if target_id is null then
		raise exception 'user_not_found';
	end if;
	perform pg_advisory_xact_lock(hashtext(target_id::text));
	insert into credit_ledger (user_id, delta, reason)
	values (target_id, credit_delta, 'admin_adjustment:' || trim(note));
	return (select coalesce(sum(delta), 0) from credit_ledger where user_id = target_id);
end;
$$;

revoke execute on function public.admin_adjust_credits(text, integer, text)
	from public, anon;
grant execute on function public.admin_adjust_credits(text, integer, text)
	to authenticated, service_role;

commit;
