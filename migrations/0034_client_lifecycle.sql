-- 0034: the client lifecycle — who we work for, who their people are, which
-- projects belong to them, and what they have asked us to build.
--
-- Additive only. No column is dropped and no row is deleted. clients.contact_name
-- and clients.email are copied into client_contacts and deliberately left in
-- place; migration 0035 removes them once the accounting reads have moved over,
-- so a half-deployed app never loses an invoice address.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

-- ---------------------------------------------------------------------------
-- Clients gain a lifecycle. Every client that exists today is one we already
-- invoice, so those rows start at 'client' rather than the 'lead' default —
-- done inside the guard so a re-run never demotes a genuine new lead.
-- ---------------------------------------------------------------------------

do $$
begin
	if not exists (
		select 1 from information_schema.columns
		where table_schema = 'public' and table_name = 'clients'
			and column_name = 'lifecycle_stage'
	) then
		alter table public.clients add column lifecycle_stage text not null default 'lead';
		update public.clients set lifecycle_stage = 'client';
	end if;
end $$;

alter table public.clients
	add column if not exists website text not null default '',
	add column if not exists owner_id uuid references public.profiles (id) on delete set null;

alter table public.clients drop constraint if exists clients_lifecycle_stage_check;
alter table public.clients add constraint clients_lifecycle_stage_check
	check (lifecycle_stage in ('lead', 'prospect', 'client', 'dormant', 'lost'));

-- The register is the whole team's, not only the accounting admin's. The
-- existing admin policy stays; this one sits beside it.
drop policy if exists "project managers manage the client register" on public.clients;
create policy "project managers manage the client register" on public.clients
	for all using (public.is_project_manager()) with check (public.is_project_manager());

-- ---------------------------------------------------------------------------
-- The people at a client. One person, one row.
-- ---------------------------------------------------------------------------

create table if not exists public.client_contacts (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null references public.clients (id) on delete cascade,
	account_id uuid unique references auth.users (id) on delete set null,
	name text not null,
	email text not null,
	phone text not null default '',
	role text not null default '',
	is_primary boolean not null default false,
	invited_at timestamptz,
	created_at timestamptz not null default now(),
	unique (client_id, email)
);

create unique index if not exists client_contacts_single_primary
	on public.client_contacts (client_id) where is_primary;

insert into public.client_contacts (client_id, name, email, is_primary)
select id, coalesce(nullif(contact_name, ''), name), email, true
from public.clients
where email <> ''
on conflict (client_id, email) do nothing;

-- Which client the signed-in account belongs to, or null for staff and
-- strangers. Security definer because the policies below query the very table
-- they protect.
create or replace function public.client_id_for_account()
returns uuid
language sql
stable
security definer
set search_path to 'public'
as $$
	select client_id from client_contacts where account_id = auth.uid() limit 1;
$$;

alter table public.client_contacts enable row level security;

drop policy if exists "project managers manage client contacts" on public.client_contacts;
create policy "project managers manage client contacts" on public.client_contacts
	for all using (public.is_project_manager()) with check (public.is_project_manager());

drop policy if exists "contacts read themselves" on public.client_contacts;
create policy "contacts read themselves" on public.client_contacts
	for select using (account_id = auth.uid());

-- ---------------------------------------------------------------------------
-- A project is the system a client sees. A null client means an internal
-- YBT product.
-- ---------------------------------------------------------------------------

alter table public.projects
	add column if not exists client_id uuid references public.clients (id) on delete set null,
	add column if not exists repository_url text not null default '',
	add column if not exists environment_url text not null default '';

create index if not exists projects_by_client on public.projects (client_id);

drop policy if exists "contacts read their own projects" on public.projects;
create policy "contacts read their own projects" on public.projects
	for select using (client_id is not null and client_id = public.client_id_for_account());

-- ---------------------------------------------------------------------------
-- What clients ask for. The request number is the identity; the FR-0001
-- reference shown to people is derived from it in the application, never
-- stored twice. Delivery is not a column either — a request is delivered when
-- its task is done.
-- ---------------------------------------------------------------------------

create table if not exists public.feature_requests (
	id uuid primary key default gen_random_uuid(),
	request_number integer generated always as identity,
	project_id uuid not null references public.projects (id) on delete cascade,
	raised_by_contact_id uuid not null references public.client_contacts (id) on delete restrict,
	title text not null,
	body text not null,
	benefit text not null default '',
	status text not null default 'new' check (status in ('new', 'accepted', 'declined')),
	decision_note text not null default '',
	decided_by uuid references public.profiles (id) on delete set null,
	decided_at timestamptz,
	task_id uuid references public.tasks (id) on delete set null,
	created_at timestamptz not null default now()
);

create unique index if not exists feature_requests_number on public.feature_requests (request_number);
create index if not exists feature_requests_by_project on public.feature_requests (project_id, created_at desc);
create index if not exists feature_requests_triage on public.feature_requests (status, created_at desc);

create table if not exists public.feature_request_comments (
	id uuid primary key default gen_random_uuid(),
	request_id uuid not null references public.feature_requests (id) on delete cascade,
	author_account_id uuid not null references auth.users (id) on delete cascade,
	body text not null,
	created_at timestamptz not null default now()
);

create index if not exists feature_request_comments_by_request
	on public.feature_request_comments (request_id, created_at);

alter table public.feature_requests enable row level security;
alter table public.feature_request_comments enable row level security;

drop policy if exists "project managers manage feature requests" on public.feature_requests;
create policy "project managers manage feature requests" on public.feature_requests
	for all using (public.is_project_manager()) with check (public.is_project_manager());

drop policy if exists "contacts read their own requests" on public.feature_requests;
create policy "contacts read their own requests" on public.feature_requests
	for select using (
		exists (
			select 1 from public.projects
			where projects.id = feature_requests.project_id
				and projects.client_id = public.client_id_for_account()
		)
	);

drop policy if exists "project managers manage request comments" on public.feature_request_comments;
create policy "project managers manage request comments" on public.feature_request_comments
	for all using (public.is_project_manager()) with check (public.is_project_manager());

drop policy if exists "contacts read comments on their own requests" on public.feature_request_comments;
create policy "contacts read comments on their own requests" on public.feature_request_comments
	for select using (
		exists (
			select 1 from public.feature_requests
			join public.projects on projects.id = feature_requests.project_id
			where feature_requests.id = feature_request_comments.request_id
				and projects.client_id = public.client_id_for_account()
		)
	);

-- ---------------------------------------------------------------------------
-- The relationship ledger, same idiom as brain_events.
-- ---------------------------------------------------------------------------

create table if not exists public.client_events (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null references public.clients (id) on delete cascade,
	kind text not null check (kind in (
		'stage_moved',
		'contact_added',
		'contact_invited',
		'project_assigned',
		'request_raised',
		'request_decided',
		'request_promoted'
	)),
	detail jsonb not null default '{}'::jsonb,
	actor_account_id uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now()
);

create index if not exists client_events_by_client on public.client_events (client_id, created_at desc);

alter table public.client_events enable row level security;

drop policy if exists "project managers manage client events" on public.client_events;
create policy "project managers manage client events" on public.client_events
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
