-- 0019: domain goal — the owner's statement of what a domain brain is meant
-- to articulate. The Modeller reads it on every ingest so the model stays a
-- system of abstractions of that domain, never a catalog of the named things
-- the source documents happen to describe.

begin;

alter table public.domain_brains add column domain_goal text not null default '';

commit;

notify pgrst, 'reload schema';
