-- 0040: the Builder. A task carries the brief staff wrote for it, where its
-- build got to, and the links to the pull request and the run. The client
-- ledger learns two more kinds of event. Safe to re-run.

alter table public.tasks
	add column if not exists build_brief text not null default '',
	add column if not exists build_status text not null default 'not_sent',
	add column if not exists pull_request_url text not null default '',
	add column if not exists build_session_url text not null default '',
	add column if not exists has_migration boolean not null default false;

alter table public.tasks drop constraint if exists tasks_build_status_check;
alter table public.tasks add constraint tasks_build_status_check
	check (build_status in ('not_sent', 'queued', 'building', 'in_review', 'live', 'failed'));

create index if not exists tasks_by_build_status on public.tasks (build_status)
	where build_status <> 'not_sent';

alter table public.client_events drop constraint if exists client_events_kind_check;
alter table public.client_events add constraint client_events_kind_check
	check (kind in (
		'stage_moved',
		'contact_added',
		'contact_invited',
		'project_assigned',
		'request_raised',
		'request_decided',
		'request_promoted',
		'build_dispatched',
		'build_live'
	));

notify pgrst, 'reload schema';
