-- New accounts start with zero credits. Removes the welcome-credit grant in
-- both places it fired: the email-confirmation trigger and the confirmed-at
-- branch inside handle_new_user. The profile row is still created for every
-- signup; an account's first credits now come only from a purchase or an
-- admin grant.

begin;

drop trigger if exists on_auth_user_confirmed on auth.users;
drop function if exists public.handle_user_email_confirmed();
drop function if exists public.grant_welcome_credits(uuid);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	insert into profiles (id, email, is_admin)
	values (new.id, coalesce(new.email, ''),
		coalesce(new.email, '') = 'jamesbeadle1989@gmail.com');
	return new;
end;
$$;

commit;
