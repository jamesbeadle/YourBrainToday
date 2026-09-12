-- Account resolution by email, without the service key.
-- Sharing and credit gifts need to turn an email into an account id; this
-- security-definer function does the lookup for any signed-in user, replacing
-- the service-client dependency that broke in environments without
-- SUPABASE_SECRET_KEY.

begin;

create or replace function public.resolve_account_email(candidate text)
returns table (account_id uuid, account_email text)
language sql
stable
security definer
set search_path to 'public'
as $$
  select id, email from profiles
  where auth.uid() is not null
    and lower(email) = lower(trim(candidate))
  limit 1;
$$;

commit;
