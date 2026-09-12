-- 0020: brain marketplace — sell domain knowledge for credits.
-- A listing puts one domain brain on the market. An edition is a frozen copy
-- of the brain (a snapshot row in domain_brains marked edition_of, with its
-- contexts and pages copied) that buyers keep forever. A subscription grants
-- live read access to the brain itself for 30 days per payment; renewing
-- extends the period. Buyers pay in credits; the seller's ledger is credited.
-- Buyers ask questions on their own credits, exactly like collaborators.

begin;

alter table public.domain_brains add column edition_of uuid
  references public.domain_brains (id) on delete cascade;

create table public.brain_listings (
  id uuid primary key default gen_random_uuid(),
  brain_id uuid not null unique references public.domain_brains (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  owner_email text not null default '',
  headline text not null,
  description text not null default '',
  edition_price_credits integer check (edition_price_credits between 1 and 1000000),
  subscription_price_credits integer check (subscription_price_credits between 1 and 1000000),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  check (edition_price_credits is not null or subscription_price_credits is not null)
);

create table public.brain_editions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.brain_listings (id) on delete cascade,
  snapshot_brain_id uuid not null unique references public.domain_brains (id) on delete cascade,
  name text not null,
  version integer not null,
  published_at timestamptz not null default now(),
  unique (listing_id, version)
);

create table public.brain_purchases (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.brain_listings (id) on delete cascade,
  buyer_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('edition', 'subscription')),
  edition_id uuid references public.brain_editions (id) on delete cascade,
  price_credits integer not null,
  purchased_at timestamptz not null default now(),
  current_period_end timestamptz,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  check ((kind = 'edition') = (edition_id is not null)),
  check ((kind = 'subscription') = (current_period_end is not null))
);

create unique index brain_purchases_one_edition_copy
  on public.brain_purchases (buyer_id, edition_id) where kind = 'edition';
create unique index brain_purchases_one_subscription
  on public.brain_purchases (buyer_id, listing_id) where kind = 'subscription';

alter table public.brain_listings enable row level security;
alter table public.brain_editions enable row level security;
alter table public.brain_purchases enable row level security;

create or replace function public.is_listing_owner(target_listing uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from brain_listings where id = target_listing and owner_id = auth.uid()
  );
$$;

create or replace function public.has_purchased_brain_access(target_brain uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from brain_purchases purchase
    join brain_editions edition on edition.id = purchase.edition_id
    where purchase.buyer_id = auth.uid()
      and purchase.kind = 'edition'
      and edition.snapshot_brain_id = target_brain
  ) or exists (
    select 1 from brain_purchases purchase
    join brain_listings listing on listing.id = purchase.listing_id
    where purchase.buyer_id = auth.uid()
      and purchase.kind = 'subscription'
      and purchase.current_period_end > now()
      and listing.brain_id = target_brain
  );
$$;

create policy "Owners manage their listings" on public.brain_listings
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Signed-in users browse published listings" on public.brain_listings
  for select using (is_published and auth.uid() is not null);

create policy "Owners manage their editions" on public.brain_editions
  for all using (public.is_listing_owner(listing_id))
  with check (public.is_listing_owner(listing_id));
create policy "Published editions are browsable" on public.brain_editions
  for select using (exists (
    select 1 from public.brain_listings listing
    where listing.id = listing_id and listing.is_published and auth.uid() is not null
  ));
create policy "Buyers read their editions" on public.brain_editions
  for select using (exists (
    select 1 from public.brain_purchases purchase
    where purchase.edition_id = id and purchase.buyer_id = auth.uid()
  ));

create policy "Buyers read their purchases" on public.brain_purchases
  for select using (buyer_id = auth.uid());
create policy "Sellers read their sales" on public.brain_purchases
  for select using (public.is_listing_owner(listing_id));

create policy "Buyers read purchased brains" on public.domain_brains
  for select using (public.has_purchased_brain_access(id));
create policy "Buyers read purchased contexts" on public.brain_contexts
  for select using (public.has_purchased_brain_access(brain_id));
create policy "Buyers read purchased pages" on public.brain_pages
  for select using (public.has_purchased_brain_access(brain_id));

alter table public.brain_events drop constraint brain_events_kind_check;
alter table public.brain_events add constraint brain_events_kind_check check (
  kind in (
    'source_ingested', 'source_removed',
    'context_created', 'context_updated', 'context_deleted',
    'page_created', 'page_updated', 'page_deleted',
    'question_answered', 'brain_exported',
    'changes_proposed', 'changes_approved', 'changes_rejected',
    'edition_published'
  )
);

create or replace function public.publish_brain_edition(source_brain uuid, edition_name text)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  listing record;
  snapshot_id uuid;
  next_version integer;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  select * into listing from brain_listings
  where brain_id = source_brain and owner_id = auth.uid();
  if not found then
    raise exception 'no_listing';
  end if;
  if edition_name is null or btrim(edition_name) = '' then
    raise exception 'edition_needs_a_name';
  end if;
  insert into domain_brains (entity_id, owner_id, name, domain_goal, edition_of)
  select entity_id, owner_id, name, domain_goal, id
  from domain_brains where id = source_brain
  returning id into snapshot_id;
  insert into brain_contexts (brain_id, owner_id, slug, name, summary, is_core_domain)
  select snapshot_id, owner_id, slug, name, summary, is_core_domain
  from brain_contexts where brain_id = source_brain;
  insert into brain_pages (brain_id, owner_id, context_slug, kind, slug, title, summary, body)
  select snapshot_id, owner_id, context_slug, kind, slug, title, summary, body
  from brain_pages where brain_id = source_brain;
  select coalesce(max(version), 0) + 1 into next_version
  from brain_editions where listing_id = listing.id;
  insert into brain_editions (listing_id, snapshot_brain_id, name, version)
  values (listing.id, snapshot_id, btrim(edition_name), next_version);
  return snapshot_id;
end;
$$;

create or replace function public.purchase_brain_edition(target_edition uuid)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  edition record;
  listing record;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if (select is_restricted from profiles where id = auth.uid()) then
    raise exception 'account_restricted';
  end if;
  select * into edition from brain_editions where id = target_edition;
  if not found then
    raise exception 'unknown_edition';
  end if;
  select * into listing from brain_listings where id = edition.listing_id;
  if not listing.is_published or listing.edition_price_credits is null then
    raise exception 'not_for_sale';
  end if;
  if listing.owner_id = auth.uid() then
    raise exception 'own_listing';
  end if;
  if exists (
    select 1 from brain_purchases
    where buyer_id = auth.uid() and edition_id = target_edition
  ) then
    raise exception 'already_owned';
  end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  if credit_balance() < listing.edition_price_credits then
    raise exception 'insufficient_credits';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (auth.uid(), -listing.edition_price_credits, 'brain_edition_bought');
  insert into credit_ledger (user_id, delta, reason)
  values (listing.owner_id, listing.edition_price_credits, 'brain_edition_sold');
  insert into brain_purchases (listing_id, buyer_id, kind, edition_id, price_credits)
  values (listing.id, auth.uid(), 'edition', target_edition, listing.edition_price_credits);
  return credit_balance();
end;
$$;

create or replace function public.subscribe_to_brain(target_listing uuid)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  listing record;
  subscription record;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if (select is_restricted from profiles where id = auth.uid()) then
    raise exception 'account_restricted';
  end if;
  select * into listing from brain_listings where id = target_listing;
  if not found or not listing.is_published or listing.subscription_price_credits is null then
    raise exception 'not_for_sale';
  end if;
  if listing.owner_id = auth.uid() then
    raise exception 'own_listing';
  end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  if credit_balance() < listing.subscription_price_credits then
    raise exception 'insufficient_credits';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (auth.uid(), -listing.subscription_price_credits, 'brain_subscription_paid');
  insert into credit_ledger (user_id, delta, reason)
  values (listing.owner_id, listing.subscription_price_credits, 'brain_subscription_earned');
  select * into subscription from brain_purchases
  where buyer_id = auth.uid() and listing_id = target_listing and kind = 'subscription';
  if found then
    update brain_purchases
    set current_period_end = greatest(now(), subscription.current_period_end) + interval '30 days',
        status = 'active',
        price_credits = listing.subscription_price_credits
    where id = subscription.id;
    return credit_balance();
  end if;
  insert into brain_purchases
    (listing_id, buyer_id, kind, price_credits, current_period_end)
  values
    (target_listing, auth.uid(), 'subscription', listing.subscription_price_credits,
     now() + interval '30 days');
  return credit_balance();
end;
$$;

create or replace function public.cancel_brain_subscription(target_listing uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  updated_count integer;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  update brain_purchases set status = 'cancelled'
  where buyer_id = auth.uid() and listing_id = target_listing and kind = 'subscription';
  get diagnostics updated_count = row_count;
  if updated_count = 0 then
    raise exception 'no_subscription';
  end if;
end;
$$;

commit;

notify pgrst, 'reload schema';
