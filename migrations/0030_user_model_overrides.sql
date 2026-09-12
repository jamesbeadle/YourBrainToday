-- Per-user model overrides. The site model stays the system-wide default;
-- an admin can pin individual users to a different Claude model, and every
-- AI request that user makes resolves override → site model. Users can read
-- their own row; only admin_set_user_model writes.

begin;

create table public.user_model_overrides (
  user_id uuid primary key references auth.users (id) on delete cascade,
  model_id text not null,
  updated_at timestamptz not null default now()
);

alter table public.user_model_overrides enable row level security;

create policy "Users read their own model override" on public.user_model_overrides
  for select using (user_id = auth.uid());

create or replace function public.admin_set_user_model(target_email text, new_model text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  target_id uuid;
begin
  perform public.assert_admin();
  select id into target_id from profiles where lower(email) = lower(trim(target_email));
  if target_id is null then
    raise exception 'unknown_user';
  end if;
  if new_model is null or length(trim(new_model)) = 0 then
    delete from user_model_overrides where user_id = target_id;
    return;
  end if;
  insert into user_model_overrides (user_id, model_id)
  values (target_id, new_model)
  on conflict (user_id) do update
  set model_id = excluded.model_id, updated_at = now();
end;
$$;

create or replace function public.admin_list_model_overrides()
returns table (email text, model_id text)
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  perform public.assert_admin();
  return query
    select profiles.email, user_model_overrides.model_id
    from user_model_overrides
    join profiles on profiles.id = user_model_overrides.user_id;
end;
$$;

commit;
