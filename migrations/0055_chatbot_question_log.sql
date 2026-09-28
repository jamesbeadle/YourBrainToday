-- 0055: the question log and preferred answers. A chatbot's owner can now
-- read every question their members asked and what the bot answered — the
-- record an operative relies on when the rule is "ask the bot before you
-- start" — and set a preferred answer (a ruling) on any question. The bot is
-- shown its rulings at every ask and answers with the owner's words when the
-- same question comes up again. See docs/chatbot-architecture.md.

begin;

create policy "Owners read their chatbots' conversations" on public.chatbot_conversations
  for select using (public.is_chatbot_owner(chatbot_id));

create policy "Owners read their chatbots' messages" on public.chatbot_messages
  for select using (
    exists (select 1 from chatbot_conversations
            where id = conversation_id and public.is_chatbot_owner(chatbot_id))
  );

create table public.chatbot_rulings (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references public.chatbots (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question text not null,
  preferred_answer text not null,
  asked_by_member_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index chatbot_rulings_by_chatbot on public.chatbot_rulings (chatbot_id, created_at desc);

alter table public.chatbot_rulings enable row level security;

-- Owners write rulings on their own bots; the ask endpoint reads them through
-- the service role once membership is proven. Members never see the list.
create policy "Owners manage chatbot rulings" on public.chatbot_rulings
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.is_chatbot_owner(chatbot_id));

commit;
