-- 0046: close the three ways a signed-in user could take what is not theirs.
--
-- 1. purchase_credit_pack granted a pack's credits with no payment. It stays
--    for the admin to test the credit flow, and refuses everyone else.
-- 2. Every refund function was callable from the browser. The cumulative
--    guard ("refunds never exceed spends for that reason") does not stop a
--    chatbot top-up or a credit gift being refunded while the pool or the
--    recipient keeps the credits. Refunds now happen only through the server,
--    which names the payer; the browser-callable functions are dropped.
-- 3. kb_brains, kb_brain_items, kb_brain_bindings and kb_item_links let any
--    signed-in user insert a row into somebody else's knowledge base as long
--    as the row's owner_id was their own. Chatbots read brains by knowledge
--    base through the service role, so that row would have answered a
--    manager's staff. Insert checks now name the parent as well as the owner,
--    the way 0031 already does for chatbots.
--
-- Safe to re-run. Run through scripts/run-migration.sh or the Supabase
-- migration tooling; do not run by hand in pieces.

begin;

-- ---------------------------------------------------------------------------
-- 1. Free packs are an admin testing tool, nothing more.
-- ---------------------------------------------------------------------------

create or replace function public.purchase_credit_pack(pack_identifier text)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	pack credit_packs%rowtype;
begin
	perform require_admin();
	select * into pack from credit_packs where id = pack_identifier;
	if not found then
		raise exception 'unknown_pack';
	end if;
	insert into purchases (user_id, pack_id, credits, amount_pence, stripe_checkout_session_id)
	values (auth.uid(), pack.id, pack.credits, pack.price_pence,
		'admin_test_pack_' || gen_random_uuid());
	insert into credit_ledger (user_id, delta, reason)
	values (auth.uid(), pack.credits, 'admin_test_pack:' || pack.id);
	return credit_balance();
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. One refund function, server-only, payer named by the caller.
-- ---------------------------------------------------------------------------

create or replace function public.refund_credits_for_user(
	payer uuid,
	amount integer,
	refund_reason text
)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	spent_total integer;
	refunded_total integer;
begin
	if payer is null then
		raise exception 'unknown_payer';
	end if;
	if amount is null or amount <= 0 then
		raise exception 'invalid_amount';
	end if;
	if refund_reason is null or length(trim(refund_reason)) = 0 then
		raise exception 'invalid_reason';
	end if;
	perform pg_advisory_xact_lock(hashtext(payer::text));
	select coalesce(sum(-delta), 0) into spent_total from credit_ledger
		where user_id = payer and reason = refund_reason and delta < 0;
	select coalesce(sum(delta), 0) into refunded_total from credit_ledger
		where user_id = payer and reason = refund_reason || '_refund' and delta > 0;
	if refunded_total + amount > spent_total then
		raise exception 'nothing_to_refund';
	end if;
	insert into credit_ledger (user_id, delta, reason)
	values (payer, amount, refund_reason || '_refund');
	return (select coalesce(sum(delta), 0) from credit_ledger where user_id = payer);
end;
$$;

revoke execute on function public.refund_credits_for_user(uuid, integer, text)
	from public, anon, authenticated;
grant execute on function public.refund_credits_for_user(uuid, integer, text) to service_role;

drop function if exists public.refund_credits_for(integer, text);
drop function if exists public.refund_for_brain_question();
drop function if exists public.refund_for_brain_ingest();
drop function if exists public.refund_for_brain_prune();
drop function if exists public.refund_for_brain_unlearn();
drop function if exists public.refund_for_hive_mind_question();
drop function if exists public.refund_for_brain_api_question(text);

-- ---------------------------------------------------------------------------
-- 3. A row in a knowledge base must sit on a knowledge base the caller owns.
-- ---------------------------------------------------------------------------

create or replace function public.is_knowledge_base_owner(target_knowledge_base uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (
		select 1 from knowledge_bases
		where id = target_knowledge_base and owner_id = auth.uid()
	);
$$;

create or replace function public.is_kb_brain_owner(target_brain uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (
		select 1 from kb_brains brain
		join knowledge_bases base on base.id = brain.knowledge_base_id
		where brain.id = target_brain and base.owner_id = auth.uid()
	);
$$;

drop policy if exists "Owners manage their kb brains" on public.kb_brains;
create policy "Owners manage their kb brains" on public.kb_brains
	for all using (owner_id = auth.uid())
	with check (owner_id = auth.uid() and public.is_knowledge_base_owner(knowledge_base_id));

drop policy if exists "Owners manage their kb bindings" on public.kb_brain_bindings;
create policy "Owners manage their kb bindings" on public.kb_brain_bindings
	for all using (owner_id = auth.uid())
	with check (
		owner_id = auth.uid()
		and public.is_kb_brain_owner(instance_brain_id)
		and public.is_kb_brain_owner(domain_brain_id)
	);

drop policy if exists "Owners manage their kb items" on public.kb_brain_items;
create policy "Owners manage their kb items" on public.kb_brain_items
	for all using (owner_id = auth.uid())
	with check (owner_id = auth.uid() and public.is_kb_brain_owner(brain_id));

create or replace function public.is_kb_item_owner(target_item uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (
		select 1 from kb_brain_items item
		where item.id = target_item and public.is_kb_brain_owner(item.brain_id)
	);
$$;

drop policy if exists "Owners manage their kb item links" on public.kb_item_links;
create policy "Owners manage their kb item links" on public.kb_item_links
	for all using (owner_id = auth.uid())
	with check (
		owner_id = auth.uid()
		and public.is_kb_item_owner(from_item_id)
		and public.is_kb_item_owner(to_item_id)
	);

commit;
