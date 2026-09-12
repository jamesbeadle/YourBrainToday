-- 0051: goals, support tasks, conversations and project membership.
--
-- A project has goals; a goal has tasks; a task is either work we planned or a
-- support task somebody raised and is waiting for an answer on. Every goal and
-- every task carries one conversation, and an inbox cursor per account makes
-- "what has been said since I last looked" a single query. Access to a project
-- for anyone who is not staff is explicit membership, granted by an admin.
--
-- Feature requests fold into support tasks: each becomes (or already is) a task,
-- its thread becomes the task's conversation, its decision note becomes the
-- resolution. Task comments become internal messages. The old tables and rows
-- stay untouched — additive only, safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

-- ---------------------------------------------------------------------------
-- Membership: who may reach a project without being staff.
-- ---------------------------------------------------------------------------

create table if not exists public.project_members (
	project_id uuid not null references public.projects (id) on delete cascade,
	account_id uuid not null references auth.users (id) on delete cascade,
	added_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	primary key (project_id, account_id)
);

create index if not exists project_members_by_account on public.project_members (account_id);

create or replace function public.is_project_member(project uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (
		select 1 from project_members
		where project_id = project and account_id = auth.uid()
	);
$$;

create or replace function public.is_administrator()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (select 1 from profiles where id = auth.uid() and is_admin);
$$;

alter table public.project_members enable row level security;

drop policy if exists "administrators manage project members" on public.project_members;
create policy "administrators manage project members" on public.project_members
	for all using (public.is_administrator()) with check (public.is_administrator());

drop policy if exists "project managers read project members" on public.project_members;
create policy "project managers read project members" on public.project_members
	for select using (public.is_project_manager());

drop policy if exists "members read their own membership" on public.project_members;
create policy "members read their own membership" on public.project_members
	for select using (account_id = auth.uid());

-- Access is membership, never inferred from the company a contact works at.
drop policy if exists "contacts read their own projects" on public.projects;

drop policy if exists "members read their projects" on public.projects;
create policy "members read their projects" on public.projects
	for select using (public.is_project_member(id));

-- ---------------------------------------------------------------------------
-- Goals: high level, measurable, and the parent of a project's tasks.
-- ---------------------------------------------------------------------------

create table if not exists public.goals (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.projects (id) on delete cascade,
	title text not null,
	measure text not null default '',
	status text not null default 'open' check (status in ('open', 'met', 'dropped')),
	priority integer not null,
	created_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now()
);

create index if not exists goals_project_priority on public.goals (project_id, priority);

alter table public.goals enable row level security;

drop policy if exists "project managers manage goals" on public.goals;
create policy "project managers manage goals" on public.goals
	for all using (public.is_project_manager()) with check (public.is_project_manager());

drop policy if exists "members read goals on their projects" on public.goals;
create policy "members read goals on their projects" on public.goals
	for select using (public.is_project_member(project_id));

-- ---------------------------------------------------------------------------
-- Tasks: which goal, which kind, and the resolution a support task closes with.
-- ---------------------------------------------------------------------------

alter table public.tasks
	add column if not exists goal_id uuid references public.goals (id) on delete set null,
	add column if not exists kind text not null default 'work',
	add column if not exists resolution text not null default '',
	add column if not exists resolved_at timestamptz;

alter table public.tasks drop constraint if exists tasks_kind_check;
alter table public.tasks add constraint tasks_kind_check check (kind in ('work', 'support'));

create index if not exists tasks_by_goal on public.tasks (goal_id);
create index if not exists tasks_open_support on public.tasks (kind, status) where kind = 'support';

drop policy if exists "members read tasks on their projects" on public.tasks;
create policy "members read tasks on their projects" on public.tasks
	for select using (public.is_project_member(project_id));

-- ---------------------------------------------------------------------------
-- Conversations: one thread on every goal and every task.
-- ---------------------------------------------------------------------------

create table if not exists public.conversation_messages (
	id uuid primary key default gen_random_uuid(),
	goal_id uuid references public.goals (id) on delete cascade,
	task_id uuid references public.tasks (id) on delete cascade,
	author_account_id uuid not null references auth.users (id) on delete cascade,
	body text not null,
	is_internal boolean not null default false,
	created_at timestamptz not null default now(),
	constraint conversation_messages_one_subject check ((goal_id is null) <> (task_id is null))
);

create index if not exists conversation_messages_by_goal
	on public.conversation_messages (goal_id, created_at) where goal_id is not null;
create index if not exists conversation_messages_by_task
	on public.conversation_messages (task_id, created_at) where task_id is not null;
create index if not exists conversation_messages_recency on public.conversation_messages (created_at desc);

alter table public.conversation_messages enable row level security;

drop policy if exists "project managers manage messages" on public.conversation_messages;
create policy "project managers manage messages" on public.conversation_messages
	for all using (public.is_project_manager()) with check (public.is_project_manager());

create or replace function public.message_project_id(goal uuid, task uuid)
returns uuid
language sql
stable
security definer
set search_path to 'public'
as $$
	select coalesce(
		(select project_id from goals where id = goal),
		(select project_id from tasks where id = task)
	);
$$;

drop policy if exists "members read shared messages on their projects" on public.conversation_messages;
create policy "members read shared messages on their projects" on public.conversation_messages
	for select using (
		not is_internal and public.is_project_member(public.message_project_id(goal_id, task_id))
	);

drop policy if exists "members post shared messages on their projects" on public.conversation_messages;
create policy "members post shared messages on their projects" on public.conversation_messages
	for insert with check (
		not is_internal
		and author_account_id = auth.uid()
		and public.is_project_member(public.message_project_id(goal_id, task_id))
	);

-- ---------------------------------------------------------------------------
-- Notifications follow the conversation: a message on a task tells its
-- assignees, as a comment used to. comment_id stays for the rows that exist.
-- ---------------------------------------------------------------------------

alter table public.notifications
	add column if not exists message_id uuid references public.conversation_messages (id) on delete cascade,
	alter column comment_id drop not null;

create or replace function public.notify_task_assignees_of_message()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if new.task_id is null then
		return new;
	end if;
	insert into public.notifications (recipient_id, task_id, message_id)
	select task_assignees.profile_id, new.task_id, new.id
	from public.task_assignees
	where task_assignees.task_id = new.task_id
		and task_assignees.profile_id <> new.author_account_id;
	return new;
end;
$$;

drop trigger if exists conversation_message_notifications on public.conversation_messages;
create trigger conversation_message_notifications
	after insert on public.conversation_messages
	for each row execute function public.notify_task_assignees_of_message();

-- ---------------------------------------------------------------------------
-- The inbox: one cursor per account, so "latest messages" needs no argument.
-- ---------------------------------------------------------------------------

create table if not exists public.inbox_cursors (
	account_id uuid primary key references auth.users (id) on delete cascade,
	read_up_to timestamptz not null default now()
);

alter table public.inbox_cursors enable row level security;

drop policy if exists "accounts manage their own inbox cursor" on public.inbox_cursors;
create policy "accounts manage their own inbox cursor" on public.inbox_cursors
	for all using (account_id = auth.uid()) with check (account_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Names for people who are not staff: message authors and members. Same gate
-- as staff_directory(), so the site and the MCP server can both call it.
-- ---------------------------------------------------------------------------

create or replace function public.account_directory(account_ids uuid[])
returns table (id uuid, email text, display_name text)
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if not (public.is_project_manager() or auth.role() = 'service_role') then
		raise exception 'staff_only';
	end if;
	return query
		select profiles.id, profiles.email, profiles.display_name
		from public.profiles
		where profiles.id = any (account_ids);
end;
$$;

grant execute on function public.account_directory(uuid[]) to authenticated, service_role;

create or replace function public.account_by_email(address text)
returns table (id uuid, email text, display_name text)
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if not (public.is_project_manager() or auth.role() = 'service_role') then
		raise exception 'staff_only';
	end if;
	return query
		select profiles.id, profiles.email, profiles.display_name
		from public.profiles
		where lower(profiles.email) = lower(address)
		limit 1;
end;
$$;

grant execute on function public.account_by_email(text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Feature requests become support tasks. A promoted request already has its
-- task; an unpromoted one gets a support task on its project, and the request
-- row is pointed at it so a re-run creates nothing twice.
-- ---------------------------------------------------------------------------

do $$
declare
	request record;
	new_task_id uuid;
begin
	for request in
		select feature_requests.*, client_contacts.account_id as raiser_account_id,
			client_contacts.role as raiser_role, projects.owner_id as project_owner_id
		from public.feature_requests
		join public.client_contacts on client_contacts.id = feature_requests.raised_by_contact_id
		join public.projects on projects.id = feature_requests.project_id
		where feature_requests.task_id is null
	loop
		insert into public.tasks (
			project_id, title, details, status, priority, global_priority, created_by,
			is_user_story, story_role, story_want, story_benefit, kind, resolution, resolved_at,
			completion_percent, created_at
		)
		values (
			request.project_id,
			request.title,
			request.body,
			case when request.status = 'declined' then 'done' else 'backlog' end,
			(select coalesce(max(priority), 0) + 1 from public.tasks where project_id = request.project_id),
			(select coalesce(max(global_priority), 0) + 1 from public.tasks
				join public.projects on projects.id = tasks.project_id
				where projects.owner_id = request.project_owner_id),
			coalesce(request.raiser_account_id, request.project_owner_id),
			true,
			coalesce(nullif(request.raiser_role, ''), 'client'),
			request.title,
			request.benefit,
			'support',
			request.decision_note,
			request.decided_at,
			case when request.status = 'declined' then 100 else 0 end,
			request.created_at
		)
		returning id into new_task_id;
		update public.feature_requests set task_id = new_task_id where id = request.id;
	end loop;
end $$;

update public.tasks
set kind = 'support',
	resolution = case when tasks.resolution = '' then feature_requests.decision_note else tasks.resolution end,
	resolved_at = coalesce(tasks.resolved_at, feature_requests.decided_at)
from public.feature_requests
where feature_requests.task_id = tasks.id;

insert into public.conversation_messages (task_id, author_account_id, body, is_internal, created_at)
select feature_requests.task_id, comments.author_account_id, comments.body, false, comments.created_at
from public.feature_request_comments as comments
join public.feature_requests on feature_requests.id = comments.request_id
where feature_requests.task_id is not null
	and not exists (
		select 1 from public.conversation_messages as existing
		where existing.task_id = feature_requests.task_id
			and existing.author_account_id = comments.author_account_id
			and existing.created_at = comments.created_at
	);

insert into public.conversation_messages (task_id, author_account_id, body, is_internal, created_at)
select task_comments.task_id, task_comments.author_id, task_comments.body, true, task_comments.created_at
from public.task_comments
where not exists (
	select 1 from public.conversation_messages as existing
	where existing.task_id = task_comments.task_id
		and existing.author_account_id = task_comments.author_id
		and existing.created_at = task_comments.created_at
);

commit;

notify pgrst, 'reload schema';
