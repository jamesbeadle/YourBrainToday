-- Invitations require consent.
-- Sharing no longer grants access directly: every share starts as an invite the
-- recipient accepts or declines from their workspace. The signup auto-claim
-- trigger goes away; acceptance is an explicit act. Invites remember the
-- target's name so the invitee can see what they were invited to before they
-- have any access, and declined invites stay visible to the owner.

begin;

drop trigger if exists claim_invites_after_profile on public.profiles;
drop function if exists public.claim_workspace_invites();

alter table public.workspace_invites add column declined_at timestamptz;
alter table public.workspace_invites add column target_name text not null default '';

drop index if exists workspace_invites_one_invite;
create unique index workspace_invites_one_invite
  on public.workspace_invites (owner_id, lower(invited_email), coalesce(entity_id, brain_id))
  where claimed_at is null and declined_at is null;

insert into public.workspace_invites
  (owner_id, invited_by_email, invited_email, entity_id, brain_id, target_name)
select
  share.owner_id,
  coalesce((select email from profiles where id = share.owner_id), ''),
  share.collaborator_email,
  share.entity_id,
  share.brain_id,
  coalesce(
    (select name from domain_brains brain where brain.id = share.brain_id),
    (select name from entities entity where entity.id = share.entity_id),
    ''
  )
from public.workspace_shares share
where not exists (
  select 1 from public.workspace_invites invite
  where invite.owner_id = share.owner_id
    and lower(invite.invited_email) = lower(share.collaborator_email)
    and coalesce(invite.entity_id, invite.brain_id) = coalesce(share.entity_id, share.brain_id)
    and invite.claimed_at is null and invite.declined_at is null
);

delete from public.workspace_shares;

create policy "Invitees read their invites" on public.workspace_invites
  for select using (
    lower(invited_email) = (select lower(email) from profiles where id = auth.uid())
  );

create or replace function public.accept_workspace_invite(invite_identifier uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  invite workspace_invites%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  select * into invite from workspace_invites
  where id = invite_identifier and claimed_at is null and declined_at is null
    and lower(invited_email) = (select lower(email) from profiles where id = auth.uid());
  if invite.id is null then
    raise exception 'unknown_invite';
  end if;
  insert into workspace_shares (owner_id, collaborator_id, collaborator_email, entity_id, brain_id)
  select invite.owner_id, auth.uid(), (select email from profiles where id = auth.uid()),
    invite.entity_id, invite.brain_id
  where not exists (
    select 1 from workspace_shares share
    where share.owner_id = invite.owner_id
      and share.collaborator_id = auth.uid()
      and coalesce(share.entity_id, share.brain_id) = coalesce(invite.entity_id, invite.brain_id)
  );
  update workspace_invites set claimed_at = now() where id = invite.id;
end;
$$;

create or replace function public.decline_workspace_invite(invite_identifier uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  update workspace_invites set declined_at = now()
  where id = invite_identifier and claimed_at is null and declined_at is null
    and lower(invited_email) = (select lower(email) from profiles where id = auth.uid());
  if not found then
    raise exception 'unknown_invite';
  end if;
end;
$$;

commit;
