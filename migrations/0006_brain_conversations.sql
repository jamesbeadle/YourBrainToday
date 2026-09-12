-- Brain conversations — every turn-based exchange with the Modeller is stored.
-- A conversation belongs to one owner and one channel: 'brain' for the text
-- conversation on /domain-brain, 'face' for the spoken Tesseract conversation.
-- Messages are append-only; the modeller's replies carry the page slugs they
-- were grounded in. Mirrors the existing brain_* idioms (owner_id defaulting
-- to auth.uid(), owner-only row level security).

begin;

create table public.brain_conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  channel text not null default 'brain' check (channel in ('brain', 'face')),
  opened_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table public.brain_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.brain_conversations (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  speaker text not null check (speaker in ('user', 'modeller')),
  body text not null,
  cited_slugs text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index brain_messages_by_conversation on public.brain_messages (conversation_id, id);

alter table public.brain_conversations enable row level security;
alter table public.brain_messages enable row level security;

create policy "Owners manage their conversations" on public.brain_conversations
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Owners manage their messages" on public.brain_messages
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

commit;
