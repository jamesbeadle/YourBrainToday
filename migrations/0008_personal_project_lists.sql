-- 0008: personal project lists — every project belongs to one staff member.
-- /projects and /tasks become per-person views: each staff member has their
-- own project list and global task queue, switchable from the page header.
-- Every existing project is assigned to James, whose workspace this was.
-- Additive only and safe to re-run: the column, backfill, not-null step,
-- and index are all conditional; owner_id is only filled where it is null.

alter table public.projects add column if not exists owner_id uuid
	references auth.users (id);

update public.projects
set owner_id = (select id from auth.users where email = 'jamesbeadle1989@gmail.com')
where owner_id is null;

alter table public.projects alter column owner_id set not null;

create index if not exists projects_owner_priority on public.projects (owner_id, priority);

notify pgrst, 'reload schema';
