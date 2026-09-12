-- 0033: chatbot knowledge gaps — questions a chatbot could not answer from
-- its knowledge base, kept for the owner to answer or dismiss. Answering
-- files the owner's answer into the knowledge base's expertise brain as a
-- source document, so the bot can answer the same question next time. See
-- docs/chatbot-architecture.md.

begin;

create table public.chatbot_knowledge_gaps (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references public.chatbots (id) on delete cascade,
  member_id uuid references auth.users (id) on delete set null,
  question text not null,
  missing_knowledge text not null,
  status text not null default 'open' check (status in ('open', 'answered', 'dismissed')),
  times_asked integer not null default 1 check (times_asked >= 1),
  answer text,
  source_id uuid references public.brain_sources (id) on delete set null,
  asked_at timestamptz not null default now(),
  last_asked_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index chatbot_knowledge_gaps_by_chatbot
  on public.chatbot_knowledge_gaps (chatbot_id, status, last_asked_at desc);

alter table public.chatbot_knowledge_gaps enable row level security;

-- The ask endpoint writes gaps through the service role once the answer is
-- in hand; owners read, answer and dismiss them. Members never see them.
create policy "Owners manage chatbot knowledge gaps" on public.chatbot_knowledge_gaps
  for all using (public.is_chatbot_owner(chatbot_id))
  with check (public.is_chatbot_owner(chatbot_id));

commit;
