-- Sharing and credit gifts.
-- A workspace share grants one collaborator read access to a single domain
-- brain or a whole entity. Collaborators work on their own credits; their
-- model changes land as proposals the brain owner reviews. send_credits moves
-- credits between accounts by recipient id, resolved from an email server-side.

begin;

create table public.workspace_shares (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  collaborator_id uuid not null references auth.users (id) on delete cascade,
  collaborator_email text not null,
  entity_id uuid references public.entities (id) on delete cascade,
  brain_id uuid references public.domain_brains (id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((entity_id is null) <> (brain_id is null)),
  check (collaborator_id <> owner_id)
);

create unique index workspace_shares_one_grant
  on public.workspace_shares (owner_id, collaborator_id, coalesce(entity_id, brain_id));

alter table public.workspace_shares enable row level security;

create policy "Owners manage their shares" on public.workspace_shares
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Collaborators read their shares" on public.workspace_shares
  for select using (collaborator_id = auth.uid());

create or replace function public.is_brain_owner(target_brain uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from domain_brains where id = target_brain and owner_id = auth.uid()
  );
$$;

create or replace function public.is_brain_collaborator(target_brain uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from workspace_shares share
    join domain_brains brain on brain.id = target_brain
    where share.collaborator_id = auth.uid()
      and (share.brain_id = brain.id or share.entity_id = brain.entity_id)
  );
$$;

create or replace function public.is_entity_collaborator(target_entity uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from workspace_shares share
    where share.collaborator_id = auth.uid()
      and (share.entity_id = target_entity
        or share.brain_id in (select id from domain_brains where entity_id = target_entity))
  );
$$;

create policy "Collaborators read shared entities" on public.entities
  for select using (public.is_entity_collaborator(id));
create policy "Collaborators read shared brains" on public.domain_brains
  for select using (public.is_brain_collaborator(id));
create policy "Collaborators read shared contexts" on public.brain_contexts
  for select using (public.is_brain_collaborator(brain_id));
create policy "Collaborators read shared pages" on public.brain_pages
  for select using (public.is_brain_collaborator(brain_id));
create policy "Collaborators read shared revisions" on public.brain_page_revisions
  for select using (public.is_brain_collaborator((select brain_id from brain_pages where id = page_id)));
create policy "Collaborators read shared events" on public.brain_events
  for select using (public.is_brain_collaborator(brain_id));
create policy "Brain owners read all brain events" on public.brain_events
  for select using (public.is_brain_owner(brain_id));
create policy "Collaborators read shared sources" on public.brain_sources
  for select using (public.is_brain_collaborator(brain_id));
create policy "Brain owners read all sources" on public.brain_sources
  for select using (public.is_brain_owner(brain_id));
create policy "Brain owners update all sources" on public.brain_sources
  for update using (public.is_brain_owner(brain_id));
create policy "Brain owners remove all sources" on public.brain_sources
  for delete using (public.is_brain_owner(brain_id));

create policy "Brain owners read shared source files" on storage.objects
  for select using (
    bucket_id = 'brain-sources' and exists (
      select 1 from public.brain_sources source
      where source.storage_path = name and public.is_brain_owner(source.brain_id)
    )
  );
create policy "Brain owners remove shared source files" on storage.objects
  for delete using (
    bucket_id = 'brain-sources' and exists (
      select 1 from public.brain_sources source
      where source.storage_path = name and public.is_brain_owner(source.brain_id)
    )
  );

alter table public.brain_sources drop constraint brain_sources_status_check;
alter table public.brain_sources add constraint brain_sources_status_check check (
  status in ('uploaded', 'ingested', 'failed', 'proposed', 'rejected')
);

alter table public.brain_events drop constraint brain_events_kind_check;
alter table public.brain_events add constraint brain_events_kind_check check (
  kind in (
    'source_ingested', 'source_removed',
    'context_created', 'context_updated', 'context_deleted',
    'page_created', 'page_updated', 'page_deleted',
    'question_answered', 'brain_exported',
    'changes_proposed', 'changes_approved', 'changes_rejected'
  )
);

create table public.brain_change_proposals (
  id uuid primary key default gen_random_uuid(),
  brain_id uuid not null references public.domain_brains (id) on delete cascade,
  proposer_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  proposer_email text not null default '',
  source_id uuid references public.brain_sources (id) on delete set null,
  source_filename text not null default '',
  change_kind text not null check (
    change_kind in ('context_write', 'page_write', 'page_delete', 'context_delete')
  ),
  slug text not null,
  title text not null default '',
  payload jsonb not null default '{}',
  before jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

alter table public.brain_change_proposals enable row level security;

create policy "Collaborators propose changes" on public.brain_change_proposals
  for insert with check (proposer_id = auth.uid() and public.is_brain_collaborator(brain_id));
create policy "Proposers read their proposals" on public.brain_change_proposals
  for select using (proposer_id = auth.uid());
create policy "Brain owners read proposals" on public.brain_change_proposals
  for select using (public.is_brain_owner(brain_id));
create policy "Brain owners decide proposals" on public.brain_change_proposals
  for update using (public.is_brain_owner(brain_id));

create or replace function public.send_credits(recipient uuid, credit_amount integer)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if recipient = auth.uid() then
    raise exception 'cannot_send_to_self';
  end if;
  if credit_amount < 1 or credit_amount > 100000 then
    raise exception 'invalid_amount';
  end if;
  if (select is_restricted from profiles where id = auth.uid()) then
    raise exception 'account_restricted';
  end if;
  if not exists (select 1 from profiles where id = recipient) then
    raise exception 'unknown_recipient';
  end if;
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  if credit_balance() < credit_amount then
    raise exception 'insufficient_credits';
  end if;
  insert into credit_ledger (user_id, delta, reason)
  values (auth.uid(), -credit_amount, 'credit_gift_sent');
  insert into credit_ledger (user_id, delta, reason)
  values (recipient, credit_amount, 'credit_gift_received');
  return credit_balance();
end;
$$;

commit;
