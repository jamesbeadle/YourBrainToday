-- Ingested data records how each piece arrived, so the owner can tell a
-- document they uploaded from data an MCP server or an API client sent in to
-- train the brain. Apply before deploying: the site reads this column.

begin;

alter table public.brain_sources
  add column if not exists arrived_through text not null default 'upload';

alter table public.brain_sources drop constraint if exists brain_sources_arrived_through_check;
alter table public.brain_sources add constraint brain_sources_arrived_through_check
  check (arrived_through in ('upload', 'mcp', 'api'));

commit;
