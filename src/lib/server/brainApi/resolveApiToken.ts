import { error } from '@sveltejs/kit';
import { bearerToken, hashApiToken } from '$lib/server/tokens/apiToken';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ResolvedApiToken = {
	supabase: SupabaseClient;
	brainId: string;
	tokenHash: string;
};

// The first gate of every /api/v1 request: the bearer token must be a live
// brain API token. What it may reach — the brain it was minted for, or the
// knowledge base that brain is filed in — is the next gate's question.
export async function resolveApiToken(request: Request): Promise<ResolvedApiToken> {
	const token = bearerToken(request);
	if (token === '') error(401, 'Send an API token as: Authorization: Bearer <token>');
	const supabase = supabaseServiceClient();
	const tokenHash = hashApiToken(token);
	const { data, error: lookupError } = await supabase
		.from('brain_api_tokens')
		.select('id, brain_id, revoked_at')
		.eq('token_hash', tokenHash)
		.maybeSingle();
	if (lookupError !== null) throw lookupError;
	if (data === null || data.revoked_at !== null) error(401, 'This API token is not valid');
	await stampUse(supabase, data.id);
	return { supabase, brainId: data.brain_id, tokenHash };
}

async function stampUse(supabase: SupabaseClient, tokenId: string): Promise<void> {
	await supabase
		.from('brain_api_tokens')
		.update({ last_used_at: new Date().toISOString() })
		.eq('id', tokenId);
}
