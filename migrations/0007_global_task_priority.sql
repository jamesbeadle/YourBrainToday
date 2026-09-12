-- 0007: global task priority — one queue across every project.
-- Additive only: creates the column and index if missing, and fills
-- global_priority solely where it is null, ordered by project priority and
-- then each project's backlog order. Subtasks stay null: only top-level
-- tasks join the global queue. Existing values are never overwritten.
-- Safe to re-run.

alter table public.tasks add column if not exists global_priority integer;

with ordered as (
	select tasks.id, row_number() over (
		order by projects.priority, tasks.priority, tasks.created_at
	) + coalesce((select max(global_priority) from public.tasks), 0) as position
	from public.tasks
	join public.projects on projects.id = tasks.project_id
	where tasks.parent_task_id is null
)
update public.tasks set global_priority = ordered.position
from ordered
where public.tasks.id = ordered.id and public.tasks.global_priority is null;

create index if not exists tasks_global_priority on public.tasks (global_priority);

notify pgrst, 'reload schema';
