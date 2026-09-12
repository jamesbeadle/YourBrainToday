-- 0006: project priority order, unlimited-nesting subtasks, project status.
-- Additive only: creates columns, constraints, and indexes that are missing,
-- and fills priority solely where it is null. Existing values you have set —
-- statuses, priorities, tasks — are never overwritten. Safe to re-run.

alter table public.projects add column if not exists priority integer;

with ordered as (
	select id, row_number() over (order by created_at) as position
	from public.projects
)
update public.projects set priority = ordered.position
from ordered
where public.projects.id = ordered.id and public.projects.priority is null;

alter table public.projects alter column priority set not null;

create index if not exists projects_priority on public.projects (priority);

alter table public.tasks add column if not exists parent_task_id uuid
	references public.tasks (id) on delete cascade;

create index if not exists tasks_parent on public.tasks (parent_task_id);

alter table public.projects add column if not exists status text not null default 'active';

alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects add constraint projects_status_check
	check (status in ('active', 'on_hold', 'complete'));

notify pgrst, 'reload schema';
