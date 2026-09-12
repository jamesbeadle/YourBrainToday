-- Workspace invites — sharing with an email that has no account yet.
-- The share form no longer reveals whether an account exists: unknown emails
-- become an invite row and an invitation email. When the invitee signs up
-- (Google sign-in creates their profile), a trigger converts every unclaimed
-- invite for their email into a real workspace share.

begin;

create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  invited_by_email text not null default '',
  invited_email text not null,
  entity_id uuid references public.entities (id) on delete cascade,
  brain_id uuid references public.domain_brains (id) on delete cascade,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  check ((entity_id is null) <> (brain_id is null))
);

create unique index workspace_invites_one_invite
  on public.workspace_invites (owner_id, lower(invited_email), coalesce(entity_id, brain_id))
  where claimed_at is null;

alter table public.workspace_invites enable row level security;

create policy "Owners manage their invites" on public.workspace_invites
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create or replace function public.claim_workspace_invites()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into workspace_shares (owner_id, collaborator_id, collaborator_email, entity_id, brain_id)
  select invite.owner_id, new.id, new.email, invite.entity_id, invite.brain_id
  from workspace_invites invite
  where lower(invite.invited_email) = lower(new.email)
    and invite.claimed_at is null
    and invite.owner_id <> new.id
    and not exists (
      select 1 from workspace_shares share
      where share.owner_id = invite.owner_id
        and share.collaborator_id = new.id
        and coalesce(share.entity_id, share.brain_id) = coalesce(invite.entity_id, invite.brain_id)
    );
  update workspace_invites
  set claimed_at = now()
  where lower(invited_email) = lower(new.email) and claimed_at is null;
  return new;
end;
$$;

create trigger claim_invites_after_profile
  after insert on public.profiles
  for each row execute function public.claim_workspace_invites();

commit;
