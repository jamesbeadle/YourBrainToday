-- Removes the seeded demo@ybt.dev account and everything it owns.
-- The launch plan calls for this before real marketing traffic arrives.
-- Team records the demo account touched are cleared first, because projects,
-- tasks, and comments deliberately do not cascade from a deleted user; every
-- owner-cascading table (maps, brains, ledger) goes with the auth.users row.

begin;

delete from public.task_comments
where author_id = (select id from public.profiles where email = 'demo@ybt.dev');

delete from public.tasks
where created_by = (select id from auth.users where email = 'demo@ybt.dev');

delete from public.projects
where created_by = (select id from auth.users where email = 'demo@ybt.dev');

delete from auth.users where email = 'demo@ybt.dev';

commit;
