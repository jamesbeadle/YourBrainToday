-- 0041: task attachments — files staff attach to a task (a spec, a screenshot,
-- an export). The file itself lives in the private task-attachments Storage
-- bucket at <task id>/<attachment id>/<safe filename>; the row carries the
-- name the file is shown and downloaded under, who added it, and when. Any
-- file type is allowed up to 25 MB, enforced by the bucket as well as the app.
-- Rows cascade with their task; the app removes the stored files before it
-- deletes a task or a project, since Postgres cannot reach the bucket.
-- Additive only and safe to re-run: the table, index, bucket, and policies
-- are all created conditionally. Access mirrors task checklists — staff
-- manage everything through is_project_manager().

create table if not exists public.task_attachments (
	id uuid primary key default gen_random_uuid(),
	task_id uuid not null references public.tasks (id) on delete cascade,
	filename text not null,
	mime_type text not null,
	byte_count bigint not null,
	storage_path text not null unique,
	uploaded_by uuid not null references public.profiles (id),
	created_at timestamptz not null default now()
);

create index if not exists task_attachments_task_created
	on public.task_attachments (task_id, created_at);

alter table public.task_attachments enable row level security;

drop policy if exists "project managers manage task attachments" on public.task_attachments;
create policy "project managers manage task attachments" on public.task_attachments
	for all using (public.is_project_manager()) with check (public.is_project_manager());

insert into storage.buckets (id, name, public, file_size_limit)
values ('task-attachments', 'task-attachments', false, 26214400)
on conflict (id) do nothing;

drop policy if exists "project managers add task attachment files" on storage.objects;
create policy "project managers add task attachment files" on storage.objects
	for insert with check (bucket_id = 'task-attachments' and public.is_project_manager());

drop policy if exists "project managers read task attachment files" on storage.objects;
create policy "project managers read task attachment files" on storage.objects
	for select using (bucket_id = 'task-attachments' and public.is_project_manager());

drop policy if exists "project managers remove task attachment files" on storage.objects;
create policy "project managers remove task attachment files" on storage.objects
	for delete using (bucket_id = 'task-attachments' and public.is_project_manager());

notify pgrst, 'reload schema';
