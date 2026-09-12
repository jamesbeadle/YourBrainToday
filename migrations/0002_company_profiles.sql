-- Company profiles — the declared company data behind each Domain Brain.
-- Collected once at onboarding (skippable, editable at /account), readable in
-- aggregate by admins for outreach and product decisions. Safe to run ahead of
-- the onboarding UI shipping — the table simply sits empty until it does.
-- Assumes public.profiles(id) is the auth user id and carries is_admin,
-- matching the existing admin idioms.

begin;

create table public.company_profiles (
  owner_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  company_name text not null,
  industry text not null,
  team_size_band text not null check (
    team_size_band in ('just-me', '2-5', '6-20', '21-50', '50-plus')
  ),
  owner_role text not null,
  goal text not null default '',
  has_consented_to_contact boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.company_profiles enable row level security;

create policy "Owners manage their company profile" on public.company_profiles
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Admins read all company profiles" on public.company_profiles
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin
    )
  );

commit;
