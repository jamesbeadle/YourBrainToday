-- 0020: The Hive Mind — approved domain brains join a collective of specialists.
-- Owners apply, an admin reviews, approval freezes a snapshot of the brain's
-- contexts and pages. Any signed-in user spends credits to ask the hive one
-- question; the brains whose pages the answer read share an earnings pool,
-- paid straight onto their owners' credit balances through the ledger.
-- Additive only: no existing table or row is altered.

begin;

create table public.hive_mind_applications (
  id uuid primary key default gen_random_uuid(),
  brain_id uuid not null references public.domain_brains (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  pitch text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decision_note text not null default '',
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index one_pending_application_per_brain
  on public.hive_mind_applications (brain_id) where status = 'pending';

create table public.hive_mind_members (
  id uuid primary key default gen_random_uuid(),
  brain_id uuid not null unique references public.domain_brains (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  handle text not null unique,
  specialty_name text not null,
  pitch text not null,
  approved_at timestamptz not null default now(),
  question_count integer not null default 0,
  credits_earned integer not null default 0
);

create table public.hive_mind_snapshot_contexts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.hive_mind_members (id) on delete cascade,
  slug text not null,
  name text not null,
  summary text not null default '',
  is_core_domain boolean not null default false,
  unique (member_id, slug)
);

create table public.hive_mind_snapshot_pages (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.hive_mind_members (id) on delete cascade,
  context_slug text,
  kind text not null,
  slug text not null,
  title text not null,
  summary text not null default '',
  body text not null,
  unique (member_id, slug)
);

create table public.hive_mind_questions (
  id uuid primary key default gen_random_uuid(),
  asker_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question text not null,
  answer_markdown text not null default '',
  cited_page_keys text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.hive_mind_contributions (
  id bigint generated always as identity primary key,
  question_id uuid not null references public.hive_mind_questions (id) on delete cascade,
  member_id uuid not null references public.hive_mind_members (id) on delete cascade,
  pages_read integer not null,
  credits_awarded integer not null,
  created_at timestamptz not null default now(),
  unique (question_id, member_id)
);

alter table public.hive_mind_applications enable row level security;
alter table public.hive_mind_members enable row level security;
alter table public.hive_mind_snapshot_contexts enable row level security;
alter table public.hive_mind_snapshot_pages enable row level security;
alter table public.hive_mind_questions enable row level security;
alter table public.hive_mind_contributions enable row level security;

create policy "Owners read their applications" on public.hive_mind_applications
  for select using (owner_id = auth.uid());

create policy "Owners submit applications for their brains" on public.hive_mind_applications
  for insert with check (
    owner_id = auth.uid()
    and exists (
      select 1 from public.domain_brains brains
      where brains.id = brain_id and brains.owner_id = auth.uid()
    )
  );

create policy "Anyone may read the hive roster" on public.hive_mind_members
  for select using (true);

create policy "Signed-in users may read snapshot contexts" on public.hive_mind_snapshot_contexts
  for select using (auth.uid() is not null);

create policy "Owners may read their snapshot pages" on public.hive_mind_snapshot_pages
  for select using (
    exists (
      select 1 from public.hive_mind_members members
      where members.id = member_id and members.owner_id = auth.uid()
    )
  );

create policy "Askers read their questions" on public.hive_mind_questions
  for select using (asker_id = auth.uid());

create policy "Askers record their questions" on public.hive_mind_questions
  for insert with check (asker_id = auth.uid());

create policy "Askers and earners may read contributions" on public.hive_mind_contributions
  for select using (
    exists (
      select 1 from public.hive_mind_questions questions
      where questions.id = question_id and questions.asker_id = auth.uid()
    )
    or exists (
      select 1 from public.hive_mind_members members
      where members.id = member_id and members.owner_id = auth.uid()
    )
  );

create or replace function public.spend_for_hive_mind_question()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  credits_per_question constant integer := 25;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if (select is_restricted from profiles where id = auth.uid()) then
    raise exception 'account_restricted';
  end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  if credit_balance() < credits_per_question then
    raise exception 'insufficient_credits';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (auth.uid(), -credits_per_question, 'hive_mind_question');
  return credit_balance();
end;
$$;

create or replace function public.refund_for_hive_mind_question()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  credits_per_question constant integer := 25;
  spent_count integer;
  refunded_count integer;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  select count(*) into spent_count from credit_ledger
  where user_id = auth.uid() and reason = 'hive_mind_question';
  select count(*) into refunded_count from credit_ledger
  where user_id = auth.uid() and reason = 'hive_mind_question_refund';
  if refunded_count >= spent_count then
    raise exception 'nothing_to_refund';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (auth.uid(), credits_per_question, 'hive_mind_question_refund');
  return credit_balance();
end;
$$;

create or replace function public.hive_mind_page_index()
returns table (
  member_id uuid,
  handle text,
  context_slug text,
  kind text,
  slug text,
  title text,
  summary text
)
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  return query
    select pages.member_id, members.handle, pages.context_slug, pages.kind,
      pages.slug, pages.title, pages.summary
    from hive_mind_snapshot_pages pages
    join hive_mind_members members on members.id = pages.member_id
    order by members.handle, pages.kind, pages.title;
end;
$$;

create or replace function public.hive_mind_read_pages(page_keys text[])
returns table (member_id uuid, handle text, slug text, title text, body text)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  pages_per_read constant integer := 10;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  return query
    select members.id, members.handle, pages.slug, pages.title, pages.body
    from unnest(page_keys[1:pages_per_read]) as requested (page_key)
    join hive_mind_members members on members.handle = split_part(requested.page_key, '/', 1)
    join hive_mind_snapshot_pages pages
      on pages.member_id = members.id and pages.slug = split_part(requested.page_key, '/', 2);
end;
$$;

create or replace function public.record_hive_mind_contributions(
  question_identifier uuid,
  member_identifiers uuid[],
  pages_read_counts integer[],
  award_amounts integer[]
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  earnings_pool constant integer := 12;
  member_index integer;
  earning_owner uuid;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if not exists (
    select 1 from hive_mind_questions
    where id = question_identifier and asker_id = auth.uid()
  ) then
    raise exception 'question_not_found';
  end if;
  if exists (select 1 from hive_mind_contributions where question_id = question_identifier) then
    raise exception 'contributions_already_recorded';
  end if;
  if array_length(member_identifiers, 1) is distinct from array_length(pages_read_counts, 1)
    or array_length(member_identifiers, 1) is distinct from array_length(award_amounts, 1) then
    raise exception 'mismatched_contributions';
  end if;
  if (select coalesce(sum(amount), 0) from unnest(award_amounts) amount) > earnings_pool then
    raise exception 'award_exceeds_pool';
  end if;
  for member_index in 1 .. coalesce(array_length(member_identifiers, 1), 0) loop
    if pages_read_counts[member_index] <= 0 or award_amounts[member_index] < 0 then
      raise exception 'invalid_contribution';
    end if;
    select owner_id into earning_owner from hive_mind_members
    where id = member_identifiers[member_index];
    if earning_owner is null then
      raise exception 'member_not_found';
    end if;
    insert into hive_mind_contributions (question_id, member_id, pages_read, credits_awarded)
    values (
      question_identifier,
      member_identifiers[member_index],
      pages_read_counts[member_index],
      award_amounts[member_index]
    );
    update hive_mind_members
    set question_count = question_count + 1,
      credits_earned = credits_earned + award_amounts[member_index]
    where id = member_identifiers[member_index];
    if award_amounts[member_index] > 0 then
      insert into credit_ledger (user_id, delta, reason)
      values (earning_owner, award_amounts[member_index], 'hive_mind_earning');
    end if;
  end loop;
end;
$$;

create or replace function public.hive_mind_review_queue()
returns table (
  application_id uuid,
  brain_name text,
  owner_email text,
  pitch text,
  context_count bigint,
  page_count bigint,
  created_at timestamptz
)
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  perform public.assert_admin();
  return query
    select applications.id, brains.name, profiles.email, applications.pitch,
      (select count(*) from brain_contexts where brain_contexts.brain_id = brains.id),
      (select count(*) from brain_pages where brain_pages.brain_id = brains.id),
      applications.created_at
    from hive_mind_applications applications
    join domain_brains brains on brains.id = applications.brain_id
    join profiles on profiles.id = applications.owner_id
    where applications.status = 'pending'
    order by applications.created_at;
end;
$$;

create or replace function public.approve_hive_mind_application(application_identifier uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  application record;
  brain record;
  member_identifier uuid;
  member_handle text;
begin
  perform public.assert_admin();
  select * into application from hive_mind_applications
  where id = application_identifier and status = 'pending';
  if not found then
    raise exception 'application_not_found';
  end if;
  select * into brain from domain_brains where id = application.brain_id;
  if not found then
    raise exception 'brain_not_found';
  end if;
  member_handle := trim(both '-' from regexp_replace(lower(brain.name), '[^a-z0-9]+', '-', 'g'))
    || '-' || left(replace(brain.id::text, '-', ''), 4);
  insert into hive_mind_members (brain_id, owner_id, handle, specialty_name, pitch)
  values (brain.id, application.owner_id, member_handle, brain.name, application.pitch)
  on conflict (brain_id) do update
  set handle = excluded.handle,
    specialty_name = excluded.specialty_name,
    pitch = excluded.pitch,
    approved_at = now();
  select id into member_identifier from hive_mind_members where brain_id = brain.id;
  delete from hive_mind_snapshot_contexts where member_id = member_identifier;
  delete from hive_mind_snapshot_pages where member_id = member_identifier;
  insert into hive_mind_snapshot_contexts (member_id, slug, name, summary, is_core_domain)
  select member_identifier, slug, name, summary, is_core_domain
  from brain_contexts where brain_contexts.brain_id = brain.id;
  insert into hive_mind_snapshot_pages
    (member_id, context_slug, kind, slug, title, summary, body)
  select member_identifier, context_slug, kind, slug, title, summary, body
  from brain_pages where brain_pages.brain_id = brain.id;
  update hive_mind_applications
  set status = 'approved', decided_at = now()
  where id = application_identifier;
end;
$$;

create or replace function public.reject_hive_mind_application(
  application_identifier uuid,
  note text
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  perform public.assert_admin();
  update hive_mind_applications
  set status = 'rejected', decision_note = coalesce(note, ''), decided_at = now()
  where id = application_identifier and status = 'pending';
  if not found then
    raise exception 'application_not_found';
  end if;
end;
$$;

commit;
