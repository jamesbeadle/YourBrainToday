import { mintApiToken } from '$lib/server/tokens/apiToken';
import type { BrainApiToken, MintedBrainApiToken } from '$lib/data/brainApiTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export { hashApiToken } from '$lib/server/tokens/apiToken';

export async function createBrainApiToken(
	supabase: SupabaseClient,
	brainId: string,
	name: string
): Promise<MintedBrainApiToken> {
	const minted = mintApiToken();
	const { data, error } = await supabase
		.from('brain_api_tokens')
		.insert({
			brain_id: brainId,
			name,
			token_hash: minted.tokenHash,
			token_hint: minted.tokenHint
		})
		.select('id, name, token_hint, created_at, last_used_at')
		.single();
	if (error !== null) throw error;
	return { ...asApiToken(data), token: minted.token };
}

export async function getBrainApiTokens(
	supabase: SupabaseClient,
	brainId: string
): Promise<BrainApiToken[]> {
	const { data, error } = await supabase
		.from('brain_api_tokens')
		.select('id, name, token_hint, created_at, last_used_at')
		.eq('brain_id', brainId)
		.is('revoked_at', null)
		.order('created_at', { ascending: false });
	if (error !== null) throw error;
	return (data ?? []).map(asApiToken);
}

export async function revokeBrainApiToken(supabase: SupabaseClient, tokenId: string): Promise<void> {
	const { error } = await supabase
		.from('brain_api_tokens')
		.update({ revoked_at: new Date().toISOString() })
		.eq('id', tokenId);
	if (error !== null) throw error;
}

function asApiToken(row: {
	id: string;
	name: string;
	token_hint: string;
	created_at: string;
	last_used_at: string | null;
}): BrainApiToken {
	return {
		id: row.id,
		name: row.name,
		tokenHint: row.token_hint,
		createdAt: row.created_at,
		lastUsedAt: row.last_used_at
	};
}
