-- A share only grants access when the person who created it owns the target.
-- Without this join a user could insert a share row pointing at someone
-- else's brain or entity id and grant themselves or others read access.

begin;

create or replace function public.is_brain_collaborator(target_brain uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from workspace_shares share
    join domain_brains brain on brain.id = target_brain
    where share.collaborator_id = auth.uid()
      and share.owner_id = brain.owner_id
      and (share.brain_id = brain.id or share.entity_id = brain.entity_id)
  );
$$;

create or replace function public.is_entity_collaborator(target_entity uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from workspace_shares share
    join entities entity on entity.id = target_entity
    where share.collaborator_id = auth.uid()
      and share.owner_id = entity.owner_id
      and (share.entity_id = entity.id
        or share.brain_id in (select id from domain_brains where entity_id = entity.id))
  );
$$;

commit;
