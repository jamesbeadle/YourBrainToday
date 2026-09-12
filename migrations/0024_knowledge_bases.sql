-- Knowledge Bases — top-level containers holding Domain Brains (abstract
-- structure) and Instance Brains (populated data). A kb_brain of type
-- ddd_model wraps an existing domain_brains row so the modeller-maintained
-- DDD wiki fits in as one Domain Brain type. All other brain types store
-- their content as kb_brain_items (one generic typed row per node type,
-- rule, note, block, event, fact, record, chunk...) linked by kb_item_links.
-- Instance brains bind to Domain Brains through kb_brain_bindings so
-- instances are guided by the abstract structure. Sharing mirrors
-- workspace_shares: a viewer resolved from an email gets read access.

begin;

create table public.knowledge_bases (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  description text not null default '',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.kb_brains (
  id uuid primary key default gen_random_uuid(),
  knowledge_base_id uuid not null references public.knowledge_bases (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null check (category in ('domain', 'instance')),
  brain_type text not null,
  name text not null,
  description text not null default '',
  retrieval_config jsonb not null default '{}'::jsonb,
  domain_brain_id uuid references public.domain_brains (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.kb_brain_bindings (
  instance_brain_id uuid not null references public.kb_brains (id) on delete cascade,
  domain_brain_id uuid not null references public.kb_brains (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (instance_brain_id, domain_brain_id)
);

create table public.kb_brain_items (
  id uuid primary key default gen_random_uuid(),
  brain_id uuid not null references public.kb_brains (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_kind text not null,
  title text not null,
  body text not null default '',
  data jsonb not null default '{}'::jsonb,
  parent_item_id uuid references public.kb_brain_items (id) on delete cascade,
  position integer not null default 0,
  occurred_at timestamptz,
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.kb_item_links (
  from_item_id uuid not null references public.kb_brain_items (id) on delete cascade,
  to_item_id uuid not null references public.kb_brain_items (id) on delete cascade,
  link_kind text not null default 'relates_to',
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (from_item_id, to_item_id, link_kind)
);

create table public.kb_shares (
  id uuid primary key default gen_random_uuid(),
  knowledge_base_id uuid not null references public.knowledge_bases (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  viewer_id uuid not null references auth.users (id) on delete cascade,
  viewer_email text not null,
  created_at timestamptz not null default now(),
  unique (knowledge_base_id, viewer_id),
  check (viewer_id <> owner_id)
);

create index kb_brains_by_knowledge_base on public.kb_brains (knowledge_base_id, created_at);
create index kb_brain_items_by_brain on public.kb_brain_items (brain_id, position, created_at);
create index kb_brain_items_by_occurrence on public.kb_brain_items (brain_id, occurred_at desc);
create index kb_bindings_by_domain on public.kb_brain_bindings (domain_brain_id);

alter table public.knowledge_bases enable row level security;
alter table public.kb_brains enable row level security;
alter table public.kb_brain_bindings enable row level security;
alter table public.kb_brain_items enable row level security;
alter table public.kb_item_links enable row level security;
alter table public.kb_shares enable row level security;

create or replace function public.is_knowledge_base_viewer(target_knowledge_base uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from kb_shares
    where knowledge_base_id = target_knowledge_base and viewer_id = auth.uid()
  );
$$;

create policy "Owners manage their knowledge bases" on public.knowledge_bases
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Viewers read shared knowledge bases" on public.knowledge_bases
  for select using (public.is_knowledge_base_viewer(id));

create policy "Owners manage their kb brains" on public.kb_brains
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Viewers read shared kb brains" on public.kb_brains
  for select using (public.is_knowledge_base_viewer(knowledge_base_id));

create policy "Owners manage their kb bindings" on public.kb_brain_bindings
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Viewers read shared kb bindings" on public.kb_brain_bindings
  for select using (public.is_knowledge_base_viewer(
    (select knowledge_base_id from kb_brains where id = instance_brain_id)));

create policy "Owners manage their kb items" on public.kb_brain_items
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Viewers read shared kb items" on public.kb_brain_items
  for select using (public.is_knowledge_base_viewer(
    (select knowledge_base_id from kb_brains where id = brain_id)));

create policy "Owners manage their kb item links" on public.kb_item_links
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Viewers read shared kb item links" on public.kb_item_links
  for select using (public.is_knowledge_base_viewer(
    (select knowledge_base_id from kb_brains
     where id = (select brain_id from kb_brain_items where id = from_item_id))));

create policy "Owners manage their kb shares" on public.kb_shares
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Viewers read their kb shares" on public.kb_shares
  for select using (viewer_id = auth.uid());

commit;
