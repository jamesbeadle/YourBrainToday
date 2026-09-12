-- Site model setting.
-- One site_settings row records which Claude model every agent reply across
-- the site uses, seeded to Haiku. Reads happen server-side with the service
-- key (row level security is on with no policies, so clients cannot touch the
-- table); admin_set_site_model is the only write path and refuses non-admins.

begin;

create table public.site_settings (
	setting_name text primary key,
	setting_value text not null,
	updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

insert into public.site_settings (setting_name, setting_value)
values ('site_model', 'claude-haiku-4-5');

create or replace function public.admin_set_site_model(new_model text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
	perform public.assert_admin();
	update site_settings
	set setting_value = new_model, updated_at = now()
	where setting_name = 'site_model';
end;
$$;

commit;
