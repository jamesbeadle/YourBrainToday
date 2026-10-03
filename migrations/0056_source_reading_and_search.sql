-- 0056: reading a source in stages, and searching the four brains.
--
-- A source is read in four stages — the model, then experience, process and
-- people — one request each, so no stage can outlive a serverless function
-- and a stage that fails is resumed, not restarted. The row records which
-- stage it is on, when that stage began, what each stage added, why the last
-- one failed, and the credits reserved for the reading so a dead request can
-- be settled later. See docs/source-reading-architecture.md.
--
-- Rows written on an owner's behalf by the server — data sent over MCP or
-- the API — carry no auth.uid(); each owner column is filled from the brain
-- the row belongs to, the way brain_events already is.
--
-- Full-text search over expertise pages and brain items lets a person, the
-- orchestrator and a connected Claude find a fact that no index line names.

begin;

-- Reading state ------------------------------------------------------------

alter table public.brain_sources
  add column if not exists stage text not null default '',
  add column if not exists stage_started_at timestamptz,
  add column if not exists failure text not null default '',
  add column if not exists reserved_credits integer not null default 0,
  add column if not exists progress jsonb not null default '{}'::jsonb;

alter table public.brain_sources drop constraint if exists brain_sources_status_check;
alter table public.brain_sources add constraint brain_sources_status_check check (
  status in ('uploaded', 'reading', 'ingested', 'failed', 'proposed', 'rejected')
);

-- Owner columns filled on the server's behalf ------------------------------

create or replace function public.fill_owner_from_domain_brain()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.owner_id is null then
    select owner_id into new.owner_id from domain_brains where id = new.brain_id;
  end if;
  return new;
end;
$$;

create or replace function public.fill_source_user_from_domain_brain()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.user_id is null then
    select owner_id into new.user_id from domain_brains where id = new.brain_id;
  end if;
  return new;
end;
$$;

create or replace function public.fill_owner_from_kb_brain()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.owner_id is null then
    select owner_id into new.owner_id from kb_brains where id = new.brain_id;
  end if;
  return new;
end;
$$;

create or replace function public.fill_owner_from_knowledge_base()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.owner_id is null then
    select owner_id into new.owner_id from knowledge_bases where id = new.knowledge_base_id;
  end if;
  return new;
end;
$$;

-- Each column defaults to auth.uid(), which is null for the service role, so
-- a row the server writes reaches the trigger with no owner and is given the
-- brain's; a row a person writes keeps theirs.
drop trigger if exists brain_pages_fill_owner on public.brain_pages;
create trigger brain_pages_fill_owner before insert on public.brain_pages
  for each row execute function public.fill_owner_from_domain_brain();

drop trigger if exists brain_contexts_fill_owner on public.brain_contexts;
create trigger brain_contexts_fill_owner before insert on public.brain_contexts
  for each row execute function public.fill_owner_from_domain_brain();

drop trigger if exists brain_page_revisions_fill_owner on public.brain_page_revisions;
create trigger brain_page_revisions_fill_owner before insert on public.brain_page_revisions
  for each row execute function public.fill_owner_from_domain_brain();

drop trigger if exists brain_sources_fill_user on public.brain_sources;
create trigger brain_sources_fill_user before insert on public.brain_sources
  for each row execute function public.fill_source_user_from_domain_brain();

drop trigger if exists kb_brain_items_fill_owner on public.kb_brain_items;
create trigger kb_brain_items_fill_owner before insert on public.kb_brain_items
  for each row execute function public.fill_owner_from_kb_brain();

drop trigger if exists kb_brains_fill_owner on public.kb_brains;
create trigger kb_brains_fill_owner before insert on public.kb_brains
  for each row execute function public.fill_owner_from_knowledge_base();

-- A process map redrawn from a document on the owner's behalf ---------------

create or replace function public.save_workflow_map_for(
  map_owner uuid,
  map_workflow_id uuid,
  map_model jsonb
)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  next_version integer;
begin
  if not exists (select 1 from workflows where id = map_workflow_id and owner_id = map_owner) then
    raise exception 'unknown_workflow';
  end if;
  select coalesce(max(version), 0) + 1 into next_version
  from workflow_maps where workflow_id = map_workflow_id;
  insert into workflow_maps (user_id, workflow_id, version, model)
  values (map_owner, map_workflow_id, next_version, map_model);
  return next_version;
end;
$$;

revoke execute on function public.save_workflow_map_for(uuid, uuid, jsonb) from anon, authenticated;
grant execute on function public.save_workflow_map_for(uuid, uuid, jsonb) to service_role;

-- Search --------------------------------------------------------------------

create index if not exists brain_pages_search_index on public.brain_pages
  using gin (to_tsvector('english', title || ' ' || summary || ' ' || body));

create index if not exists kb_brain_items_search_index on public.kb_brain_items
  using gin (to_tsvector('english', title || ' ' || body));

-- Runs as the caller: a signed-in person sees what row level security lets
-- them see, and the service role (an MCP caller or an API token, already
-- proved to reach the knowledge base) sees everything in it.
create or replace function public.search_knowledge_base(
  searched_knowledge_base_id uuid,
  search_query text,
  most_hits integer default 20
)
returns table (
  hit_kind text,
  brain_id uuid,
  item_id uuid,
  slug text,
  item_kind text,
  title text,
  snippet text,
  rank real
)
language sql
stable
set search_path to 'public'
as $$
  with query as (
    select websearch_to_tsquery('english', search_query) as terms
  ),
  pages as (
    select
      'page'::text as hit_kind,
      kb.id as brain_id,
      page.id as item_id,
      page.slug,
      page.kind as item_kind,
      page.title,
      ts_headline('english', page.summary || ' ' || page.body, query.terms,
        'MaxWords=40, MinWords=20, MaxFragments=1') as snippet,
      ts_rank(to_tsvector('english', page.title || ' ' || page.summary || ' ' || page.body), query.terms) as rank
    from brain_pages page
    join kb_brains kb on kb.domain_brain_id = page.brain_id
    cross join query
    where kb.knowledge_base_id = searched_knowledge_base_id
      and to_tsvector('english', page.title || ' ' || page.summary || ' ' || page.body) @@ query.terms
  ),
  items as (
    select
      'item'::text as hit_kind,
      kb.id as brain_id,
      item.id as item_id,
      null::text as slug,
      item.item_kind,
      item.title,
      ts_headline('english', item.body, query.terms,
        'MaxWords=40, MinWords=20, MaxFragments=1') as snippet,
      ts_rank(to_tsvector('english', item.title || ' ' || item.body), query.terms) as rank
    from kb_brain_items item
    join kb_brains kb on kb.id = item.brain_id
    cross join query
    where kb.knowledge_base_id = searched_knowledge_base_id
      and to_tsvector('english', item.title || ' ' || item.body) @@ query.terms
  )
  select * from pages
  union all
  select * from items
  order by rank desc, title
  limit greatest(1, least(most_hits, 50));
$$;

grant execute on function public.search_knowledge_base(uuid, text, integer) to authenticated, service_role;

commit;
