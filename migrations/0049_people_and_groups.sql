-- 0049: people and groups. A person is one row however many companies they
-- hold; client_contacts becomes the affiliation of a person with a company;
-- links and notes follow the person; a client may sit under a parent client.
--
-- Additive first, then the move: people is created and backfilled from the
-- contacts that exist, every contact is pointed at its person, links and
-- notes are re-keyed, and only then are the moved columns dropped. Every step
-- is guarded so the file can be run again without harm.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

-- ---------------------------------------------------------------------------
-- The person. Email and officer id each identify one row where present.
-- ---------------------------------------------------------------------------

create table if not exists public.people (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	email text not null default '',
	phone text not null default '',
	companies_house_officer_id text,
	seniority text not null default '',
	is_decision_maker boolean not null default false,
	warmth text not null default 'cold' check (warmth in ('cold', 'warm', 'hot')),
	last_contacted_at date,
	next_action text not null default '',
	next_action_due date,
	source_url text not null default '',
	lead_source text not null default 'staff'
		check (lead_source in ('staff', 'website', 'research', 'companies_house')),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create unique index if not exists people_one_row_per_email
	on public.people (lower(email)) where email <> '';
create unique index if not exists people_one_row_per_officer
	on public.people (companies_house_officer_id) where companies_house_officer_id is not null;

-- ---------------------------------------------------------------------------
-- The affiliation. person_id is added nullable, filled, then made required.
-- ---------------------------------------------------------------------------

alter table public.client_contacts
	add column if not exists person_id uuid references public.people (id) on delete cascade,
	add column if not exists officer_role text not null default '',
	add column if not exists appointed_on date,
	add column if not exists resigned_on date,
	add column if not exists affiliation_source text not null default 'staff';

alter table public.client_contacts drop constraint if exists client_contacts_affiliation_source_check;
alter table public.client_contacts add constraint client_contacts_affiliation_source_check
	check (affiliation_source in ('staff', 'companies_house', 'website'));

-- One person per distinct email, or per name where there is no email, carrying
-- the profile of the contact that was written most recently.
do $$
begin
	if exists (
		select 1 from information_schema.columns
		where table_schema = 'public' and table_name = 'client_contacts' and column_name = 'email'
	) then
		insert into public.people (
			name, email, phone, seniority, is_decision_maker, warmth,
			last_contacted_at, next_action, next_action_due, source_url, created_at
		)
		select distinct on (coalesce(nullif(lower(email), ''), lower(name)))
			name, lower(email), phone, seniority, is_decision_maker, warmth,
			last_contacted_at, next_action, next_action_due, source_url, created_at
		from public.client_contacts
		where person_id is null
		order by coalesce(nullif(lower(email), ''), lower(name)), created_at desc
		on conflict do nothing;

		update public.client_contacts as contact
		set person_id = person.id
		from public.people as person
		where contact.person_id is null
			and contact.email <> ''
			and person.email = lower(contact.email);

		update public.client_contacts as contact
		set person_id = person.id
		from public.people as person
		where contact.person_id is null
			and contact.email = ''
			and person.email = ''
			and lower(person.name) = lower(contact.name);
	end if;
end $$;

alter table public.client_contacts alter column person_id set not null;

create unique index if not exists client_contacts_one_affiliation_per_person
	on public.client_contacts (client_id, person_id);
create index if not exists client_contacts_by_person on public.client_contacts (person_id);

-- ---------------------------------------------------------------------------
-- Links and notes follow the person.
-- ---------------------------------------------------------------------------

do $$
begin
	if to_regclass('public.contact_links') is not null then
		alter table public.contact_links rename to person_links;
	end if;
	if to_regclass('public.contact_notes') is not null then
		alter table public.contact_notes rename to person_notes;
	end if;
end $$;

alter table public.person_links
	add column if not exists person_id uuid references public.people (id) on delete cascade;
alter table public.person_notes
	add column if not exists person_id uuid references public.people (id) on delete cascade;

do $$
begin
	if exists (
		select 1 from information_schema.columns
		where table_schema = 'public' and table_name = 'person_links' and column_name = 'contact_id'
	) then
		update public.person_links as link
		set person_id = contact.person_id
		from public.client_contacts as contact
		where link.person_id is null and contact.id = link.contact_id;

		update public.person_notes as note
		set person_id = contact.person_id
		from public.client_contacts as contact
		where note.person_id is null and contact.id = note.contact_id;

		alter table public.person_links drop column contact_id;
		alter table public.person_notes drop column contact_id;
	end if;
end $$;

alter table public.person_links alter column person_id set not null;
alter table public.person_notes alter column person_id set not null;

create index if not exists person_links_by_person on public.person_links (person_id, created_at);
create index if not exists person_notes_by_person on public.person_notes (person_id, created_at desc);

-- ---------------------------------------------------------------------------
-- The moved columns leave the affiliation.
-- ---------------------------------------------------------------------------

drop index if exists public.client_contacts_one_row_per_email;
alter table public.client_contacts drop constraint if exists client_contacts_warmth_check;

alter table public.client_contacts
	drop column if exists name,
	drop column if exists email,
	drop column if exists phone,
	drop column if exists seniority,
	drop column if exists is_decision_maker,
	drop column if exists warmth,
	drop column if exists last_contacted_at,
	drop column if exists next_action,
	drop column if exists next_action_due,
	drop column if exists source_url;

-- ---------------------------------------------------------------------------
-- A group is a client whose children are its companies.
-- ---------------------------------------------------------------------------

alter table public.clients
	add column if not exists parent_client_id uuid references public.clients (id) on delete set null;

create index if not exists clients_by_parent on public.clients (parent_client_id);

-- ---------------------------------------------------------------------------
-- Access: project managers manage; a person reads their own row through an
-- affiliation that carries their account.
-- ---------------------------------------------------------------------------

alter table public.people enable row level security;
alter table public.person_links enable row level security;
alter table public.person_notes enable row level security;

drop policy if exists "project managers manage people" on public.people;
create policy "project managers manage people" on public.people
	for all using (public.is_project_manager()) with check (public.is_project_manager());

drop policy if exists "people read themselves" on public.people;
create policy "people read themselves" on public.people
	for select using (
		exists (
			select 1 from public.client_contacts
			where client_contacts.person_id = people.id and client_contacts.account_id = auth.uid()
		)
	);

drop policy if exists "project managers manage contact links" on public.person_links;
drop policy if exists "project managers manage person links" on public.person_links;
create policy "project managers manage person links" on public.person_links
	for all using (public.is_project_manager()) with check (public.is_project_manager());

drop policy if exists "project managers manage contact notes" on public.person_notes;
drop policy if exists "project managers manage person notes" on public.person_notes;
create policy "project managers manage person notes" on public.person_notes
	for all using (public.is_project_manager()) with check (public.is_project_manager());

-- ---------------------------------------------------------------------------
-- The ledger learns how people and groups arrive.
-- ---------------------------------------------------------------------------

alter table public.client_events drop constraint if exists client_events_kind_check;
alter table public.client_events add constraint client_events_kind_check
	check (kind in (
		'stage_moved',
		'contact_added',
		'contact_invited',
		'project_assigned',
		'request_raised',
		'request_decided',
		'request_promoted',
		'build_dispatched',
		'build_live',
		'enquiry_received',
		'lead_added',
		'profile_researched',
		'approach_drafted',
		'person_added',
		'appointments_imported',
		'officers_imported',
		'grouped_under'
	));

commit;

notify pgrst, 'reload schema';
