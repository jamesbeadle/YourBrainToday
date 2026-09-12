-- 0039: the staff directory answers the service role. The MCP server runs every
-- action on the service-role client after gating staff-only actions itself,
-- so auth.uid() is null there and the signed-in-staff check alone refused it.
-- Applied to the live project through the Supabase MCP on the day it was
-- written; kept here so the migration history is complete. Safe to re-run.

create or replace function public.staff_directory()
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
		where profiles.is_staff or profiles.is_admin
		order by profiles.email;
end;
$$;

grant execute on function public.staff_directory() to service_role;

notify pgrst, 'reload schema';
