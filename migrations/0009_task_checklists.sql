-- 0009: task checklists — named free-text lists inside a task, for tracking
-- side work such as a UAT run or a launch checklist. Each task owns any
-- number of titled lists; each list owns ordered free-text items that can be
-- ticked done. Done items stay visible (crossed out in the UI), never hidden.
-- Additive only and safe to re-run: tables, indexes, and policies are all
-- created conditionally. Access mirrors acceptance_criteria — staff manage
-- everything through is_project_manager().

create table if not exists public.task_checklists (
	id uuid primary key default gen_random_uuid(),
	task_id uuid not null references public.tasks (id) on delete cascade,
	title text not null,
	position integer not null,
	created_at timestamptz not null default now()
);

create index if not exists task_checklists_task_position
	on public.task_checklists (task_id, position);

create table if not exists public.task_checklist_items (
	id uuid primary key default gen_random_uuid(),
	checklist_id uuid not null references public.task_checklists (id) on delete cascade,
	description text not null,
	is_done boolean not null default false,
	position integer not null,
	created_at timestamptz not null default now()
);

create index if not exists task_checklist_items_checklist_position
	on public.task_checklist_items (checklist_id, position);

alter table public.task_checklists enable row level security;
alter table public.task_checklist_items enable row level security;

drop policy if exists "project managers manage task checklists" on public.task_checklists;
create policy "project managers manage task checklists" on public.task_checklists
	for all using (public.is_project_manager()) with check (public.is_project_manager());

drop policy if exists "project managers manage checklist items" on public.task_checklist_items;
create policy "project managers manage checklist items" on public.task_checklist_items
	for all using (public.is_project_manager()) with check (public.is_project_manager());

notify pgrst, 'reload schema';
