-- 0036: client access tokens — how a client contact's own Claude reaches the
-- MCP server at /api/mcp. Same idiom as the brain API tokens of 0023, with a
-- different owner: a token belongs to one contact, only its SHA-256 hash is
-- stored, and the plain text is shown once at minting and never again.
--
-- Additive only.

begin;

create table if not exists public.client_api_tokens (
	id uuid primary key default gen_random_uuid(),
	contact_id uuid not null references public.client_contacts (id) on delete cascade,
	name text not null,
	token_hash text not null unique,
	token_hint text not null default '',
	created_at timestamptz not null default now(),
	last_used_at timestamptz,
	revoked_at timestamptz
);

create index if not exists client_api_tokens_by_contact on public.client_api_tokens (contact_id);

alter table public.client_api_tokens enable row level security;

drop policy if exists "contacts manage their own access tokens" on public.client_api_tokens;
create policy "contacts manage their own access tokens" on public.client_api_tokens
	for all using (
		contact_id in (select id from public.client_contacts where account_id = auth.uid())
	) with check (
		contact_id in (select id from public.client_contacts where account_id = auth.uid())
	);

drop policy if exists "project managers manage client access tokens" on public.client_api_tokens;
create policy "project managers manage client access tokens" on public.client_api_tokens
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
