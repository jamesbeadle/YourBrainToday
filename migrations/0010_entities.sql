-- 0010: entities — the containers a user creates in their workspace.
-- An entity (a construction company, a family history, a boat engine library)
-- holds any number of domain brains and any number of workflows. Brain tables
-- gain a brain_id; workflow maps, viewers, and agent messages gain a
-- workflow_id; the sharing and map RPCs become workflow-scoped.
-- Early-access fresh start: the singleton per-user brain and map data is
-- deleted before the not-null columns are added.
-- Also widens brain_events.kind to the full set the app records.

begin;

delete from public.brain_messages;
delete from public.brain_conversations;
delete from public.brain_page_revisions;
delete from public.brain_pages;
delete from public.brain_contexts;
delete from public.brain_events;
delete from public.brain_sources;
delete from public.agent_messages;
delete from public.agent_sessions;
delete from public.workflow_maps;
delete from public.map_viewers;

create table public.entities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.domain_brains (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.entities (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.workflows (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.entities (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index domain_brains_by_entity on public.domain_brains (entity_id, created_at);
create index workflows_by_entity on public.workflows (entity_id, created_at);

alter table public.entities enable row level security;
alter table public.domain_brains enable row level security;
alter table public.workflows enable row level security;

create policy "Owners manage their entities" on public.entities
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Owners manage their domain brains" on public.domain_brains
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Owners manage their workflows" on public.workflows
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

alter table public.brain_sources add column brain_id uuid not null
  references public.domain_brains (id) on delete cascade;
alter table public.brain_contexts add column brain_id uuid not null
  references public.domain_brains (id) on delete cascade;
alter table public.brain_pages add column brain_id uuid not null
  references public.domain_brains (id) on delete cascade;
alter table public.brain_page_revisions add column brain_id uuid not null
  references public.domain_brains (id) on delete cascade;
alter table public.brain_events add column brain_id uuid not null
  references public.domain_brains (id) on delete cascade;
alter table public.brain_conversations add column brain_id uuid not null
  references public.domain_brains (id) on delete cascade;

alter table public.brain_contexts drop constraint brain_contexts_owner_id_slug_key;
alter table public.brain_contexts add unique (brain_id, slug);
alter table public.brain_pages drop constraint brain_pages_owner_id_slug_key;
alter table public.brain_pages add unique (brain_id, slug);

alter table public.brain_events drop constraint brain_events_kind_check;
alter table public.brain_events add constraint brain_events_kind_check check (
  kind in (
    'source_ingested',
    'context_created',
    'context_updated',
    'page_created',
    'page_updated',
    'question_answered',
    'brain_exported'
  )
);

alter table public.workflow_maps add column workflow_id uuid not null
  references public.workflows (id) on delete cascade;
alter table public.workflow_maps add unique (workflow_id, version);

alter table public.map_viewers drop constraint map_viewers_owner_id_viewer_email_key;
alter table public.map_viewers add column workflow_id uuid not null
  references public.workflows (id) on delete cascade;
alter table public.map_viewers add unique (workflow_id, viewer_email);

alter table public.agent_messages add column workflow_id uuid not null
  references public.workflows (id) on delete cascade;
create index agent_messages_by_workflow on public.agent_messages (workflow_id, created_at);

drop function if exists public.save_workflow_map(jsonb);

create function public.save_workflow_map(map_model jsonb, map_workflow_id uuid)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
	next_version integer;
begin
	if auth.uid() is null then
		raise exception 'not_signed_in';
	end if;
	if not exists (select 1 from workflows where id = map_workflow_id and owner_id = auth.uid()) then
		raise exception 'unknown_workflow';
	end if;
	select coalesce(max(version), 0) + 1 into next_version
	from workflow_maps where workflow_id = map_workflow_id;
	insert into workflow_maps (user_id, workflow_id, version, model)
	values (auth.uid(), map_workflow_id, next_version, map_model);
	return next_version;
end;
$function$;

drop function if exists public.get_shared_map(uuid);

create function public.get_shared_map(shared_workflow_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
	viewer_email text := (select email from profiles where id = auth.uid());
	latest_model jsonb;
begin
	if not exists (select 1 from map_viewers
		where map_viewers.workflow_id = shared_workflow_id
			and map_viewers.viewer_email = get_shared_map.viewer_email) then
		raise exception 'not_shared';
	end if;
	select model into latest_model from workflow_maps
	where workflow_maps.workflow_id = shared_workflow_id order by version desc limit 1;
	return latest_model;
end;
$function$;

drop function if exists public.shared_maps_for_viewer();

create function public.shared_maps_for_viewer()
returns table(
	workflow_id uuid,
	workflow_name text,
	entity_name text,
	owner_email text,
	version integer,
	updated_at timestamp with time zone
)
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
	return query
	select v.workflow_id, w.name, e.name, p.email, m.version, m.created_at
	from map_viewers v
	join workflows w on w.id = v.workflow_id
	join entities e on e.id = w.entity_id
	join profiles p on p.id = w.owner_id
	join lateral (
		select wm.version, wm.created_at from workflow_maps wm
		where wm.workflow_id = v.workflow_id order by wm.version desc limit 1
	) m on true
	where v.viewer_email = (select email from profiles where id = auth.uid());
end;
$function$;

commit;

notify pgrst, 'reload schema';
