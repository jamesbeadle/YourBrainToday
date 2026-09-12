-- 0038: the OAuth 2.1 authorization server behind /api/mcp — what lets a
-- person press Connect in Claude and arrive as themselves, staff or client
-- contact, with no token to copy. Clients register themselves (RFC 7591),
-- prove possession with PKCE, and hold opaque access and refresh tokens that
-- are hashed at rest like every other secret in this database.
--
-- Already applied to the live project through the Supabase MCP on the day it
-- was written; kept here so the migration history is complete. Additive only.

begin;

create table if not exists public.oauth_clients (
	client_id text primary key,
	client_secret_hash text,
	client_name text not null default '',
	redirect_uris text[] not null default '{}',
	created_at timestamptz not null default now()
);

create table if not exists public.oauth_authorization_codes (
	code_hash text primary key,
	client_id text not null references public.oauth_clients (client_id) on delete cascade,
	account_id uuid not null references auth.users (id) on delete cascade,
	redirect_uri text not null,
	code_challenge text not null,
	code_challenge_method text not null default 'S256',
	expires_at timestamptz not null,
	used_at timestamptz,
	created_at timestamptz not null default now()
);

create table if not exists public.oauth_tokens (
	id uuid primary key default gen_random_uuid(),
	token_hash text not null unique,
	kind text not null check (kind in ('access', 'refresh')),
	client_id text not null references public.oauth_clients (client_id) on delete cascade,
	account_id uuid not null references auth.users (id) on delete cascade,
	expires_at timestamptz,
	revoked_at timestamptz,
	last_used_at timestamptz,
	created_at timestamptz not null default now()
);

create index if not exists oauth_tokens_by_account on public.oauth_tokens (account_id, kind);

-- Only the service role reads these tables; a person sees and revokes their
-- own connections and nothing more.
alter table public.oauth_clients enable row level security;
alter table public.oauth_authorization_codes enable row level security;
alter table public.oauth_tokens enable row level security;

drop policy if exists "people see their own connections" on public.oauth_tokens;
create policy "people see their own connections" on public.oauth_tokens
	for select using (account_id = auth.uid());

drop policy if exists "people revoke their own connections" on public.oauth_tokens;
create policy "people revoke their own connections" on public.oauth_tokens
	for update using (account_id = auth.uid()) with check (account_id = auth.uid());

commit;

notify pgrst, 'reload schema';
