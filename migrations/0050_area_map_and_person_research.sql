-- 0050: the patch map and the person on the web. A client carries its
-- postcode so it can be pinned; postcodes are geocoded once and kept; a
-- person's notes learn what the open web said about them; the ledger says
-- when that happened. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

-- ---------------------------------------------------------------------------
-- Where a client is. Backfilled from the address and location already held.
-- ---------------------------------------------------------------------------

alter table public.clients
	add column if not exists postcode text not null default '';

with found as (
	select id,
		substring(coalesce(nullif(address, ''), location) from '(?i)([A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2})\M') as raw_postcode
	from public.clients
	where postcode = ''
)
update public.clients as client
set postcode = upper(regexp_replace(regexp_replace(found.raw_postcode, '\s', '', 'g'), '([0-9][A-Za-z]{2})$', ' \1'))
from found
where client.id = found.id and found.raw_postcode is not null;

create index if not exists clients_by_postcode on public.clients (postcode) where postcode <> '';

-- ---------------------------------------------------------------------------
-- Where a postcode is on the ground, looked up once from postcodes.io.
-- ---------------------------------------------------------------------------

create table if not exists public.postcode_locations (
	postcode text primary key,
	outcode text not null,
	latitude double precision not null,
	longitude double precision not null,
	looked_up_at timestamptz not null default now()
);

alter table public.postcode_locations enable row level security;

drop policy if exists "project managers manage postcode locations" on public.postcode_locations;
create policy "project managers manage postcode locations" on public.postcode_locations
	for all using (public.is_project_manager()) with check (public.is_project_manager());

-- ---------------------------------------------------------------------------
-- A note can be what the open web said; the ledger records the search.
-- ---------------------------------------------------------------------------

alter table public.person_notes drop constraint if exists contact_notes_kind_check;
alter table public.person_notes drop constraint if exists person_notes_kind_check;
alter table public.person_notes add constraint person_notes_kind_check
	check (kind in ('note', 'approach', 'research'));

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
		'grouped_under',
		'person_researched'
	));

commit;

notify pgrst, 'reload schema';
