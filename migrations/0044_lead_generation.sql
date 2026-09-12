-- 0044: lead generation inside the client register. A client carries the
-- profile research drafts and staff edit; a contact carries the fields that
-- say who to call and when, plus their links and notes. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

-- ---------------------------------------------------------------------------
-- The company profile, and where the lead came from.
-- ---------------------------------------------------------------------------

alter table public.clients
	add column if not exists lead_source text not null default 'staff',
	add column if not exists company_number text not null default '',
	add column if not exists industry text not null default '',
	add column if not exists location text not null default '',
	add column if not exists headcount_band text not null default '',
	add column if not exists profile_summary text not null default '',
	add column if not exists opening_angles text not null default '',
	add column if not exists profile_source_url text not null default '';

alter table public.clients drop constraint if exists clients_lead_source_check;
alter table public.clients add constraint clients_lead_source_check
	check (lead_source in ('staff', 'website', 'research', 'companies_house'));

-- ---------------------------------------------------------------------------
-- Who to call and when. A researched person rarely arrives with an email
-- address, so uniqueness holds only for contacts that have one.
-- ---------------------------------------------------------------------------

alter table public.client_contacts
	add column if not exists seniority text not null default '',
	add column if not exists is_decision_maker boolean not null default false,
	add column if not exists warmth text not null default 'cold',
	add column if not exists last_contacted_at date,
	add column if not exists next_action text not null default '',
	add column if not exists next_action_due date,
	add column if not exists source_url text not null default '';

alter table public.client_contacts drop constraint if exists client_contacts_warmth_check;
alter table public.client_contacts add constraint client_contacts_warmth_check
	check (warmth in ('cold', 'warm', 'hot'));

alter table public.client_contacts drop constraint if exists client_contacts_client_id_email_key;
create unique index if not exists client_contacts_one_row_per_email
	on public.client_contacts (client_id, email) where email <> '';

-- ---------------------------------------------------------------------------
-- Links a staff member pastes, and notes they write. An approach draft is a
-- note of kind 'approach'.
-- ---------------------------------------------------------------------------

create table if not exists public.contact_links (
	id uuid primary key default gen_random_uuid(),
	contact_id uuid not null references public.client_contacts (id) on delete cascade,
	label text not null,
	url text not null,
	created_at timestamptz not null default now()
);

create index if not exists contact_links_by_contact on public.contact_links (contact_id, created_at);

create table if not exists public.contact_notes (
	id uuid primary key default gen_random_uuid(),
	contact_id uuid not null references public.client_contacts (id) on delete cascade,
	author_id uuid references public.profiles (id) on delete set null,
	kind text not null default 'note' check (kind in ('note', 'approach')),
	body text not null,
	created_at timestamptz not null default now()
);

create index if not exists contact_notes_by_contact on public.contact_notes (contact_id, created_at desc);

alter table public.contact_links enable row level security;
alter table public.contact_notes enable row level security;

drop policy if exists "project managers manage contact links" on public.contact_links;
create policy "project managers manage contact links" on public.contact_links
	for all using (public.is_project_manager()) with check (public.is_project_manager());

drop policy if exists "project managers manage contact notes" on public.contact_notes;
create policy "project managers manage contact notes" on public.contact_notes
	for all using (public.is_project_manager()) with check (public.is_project_manager());

-- ---------------------------------------------------------------------------
-- The ledger learns how leads arrive and what Claude drafted. enquiry_received
-- is also added by 0045; listing it here means either order applies cleanly.
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
		'approach_drafted'
	));

commit;

notify pgrst, 'reload schema';
