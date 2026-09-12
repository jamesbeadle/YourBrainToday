-- Domain Brain — fresh-start migration
-- Replaces the Second Brain wiki tables with the DDD-shaped Domain Brain schema.
-- Early-access fresh start: existing wiki pages and their revisions are dropped.
-- Sources, the storage bucket, the events table, and every credit function are kept.
-- Run in the Supabase SQL editor. Mirrors the existing brain_* conventions
-- (owner_id defaulting to auth.uid(), owner-only row level security) — if the
-- live tables differ, match their idioms rather than this file's.

begin;

drop table if exists public.brain_page_revisions;
drop table if exists public.brain_pages;
delete from public.brain_events;

create table public.brain_contexts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug text not null,
  name text not null,
  summary text not null default '',
  is_core_domain boolean not null default false,
  created_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create table public.brain_pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  context_slug text,
  kind text not null check (
    kind in (
      'entity',
      'value_object',
      'aggregate',
      'domain_service',
      'domain_event',
      'glossary',
      'context_map'
    )
  ),
  slug text not null,
  title text not null,
  summary text not null default '',
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create table public.brain_page_revisions (
  id bigint generated always as identity primary key,
  page_id uuid not null references public.brain_pages (id) on delete cascade,
  owner_id uuid not null default auth.uid(),
  context_slug text,
  kind text not null,
  title text not null,
  summary text not null default '',
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.brain_contexts enable row level security;
alter table public.brain_pages enable row level security;
alter table public.brain_page_revisions enable row level security;

create policy "Owners manage their contexts" on public.brain_contexts
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Owners manage their pages" on public.brain_pages
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Owners manage their page revisions" on public.brain_page_revisions
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

commit;
