-- 0037: project lifecycle — scoping, building, testing, maintenance, complete,
-- with on hold alongside them. Renames the old 'active' state to 'building'.
-- Safe to re-run.

alter table public.projects drop constraint if exists projects_status_check;

update public.projects set status = 'building' where status = 'active';

alter table public.projects alter column status set default 'scoping';

alter table public.projects add constraint projects_status_check
	check (
		status in ('scoping', 'building', 'testing', 'maintenance', 'complete', 'on_hold')
	);

notify pgrst, 'reload schema';
