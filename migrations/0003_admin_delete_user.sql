-- Admin user deletion.
-- admin_delete_user removes an account outright: the auth.users row and, through
-- the on-delete cascades the owner tables declare, all of the account's data.
-- Two guard rails: admin accounts refuse deletion (remove the admin flag first),
-- and an account referenced by shared team data (projects or tasks it created)
-- fails to delete rather than tearing the team's records down with it.

begin;

create or replace function public.admin_delete_user(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
	target_id uuid;
	target_is_admin boolean;
begin
	perform public.assert_admin();
	select id, is_admin into target_id, target_is_admin
	from public.profiles
	where email = target_email;
	if target_id is null then
		raise exception 'user_not_found';
	end if;
	if target_is_admin then
		raise exception 'cannot_delete_admin';
	end if;
	delete from auth.users where id = target_id;
end;
$$;

commit;
