import { error } from '@sveltejs/kit';
import { getDomainBrain, type DomainBrain } from '$lib/server/entities/getDomainBrain';
import { hashApiToken } from './brainApiTokens';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { SupabaseClient } from '@supabase/supabase-js';

export type BrainApiCaller = {
	supabase: SupabaseClient;
	brain: DomainBrain;
	tokenHash: string;
};

// Authenticates one /api/v1 request: the bearer token must be a live API
// token minted for exactly the brain in the path. Returns a service-role
// client — every read it performs is pinned to the resolved brain id.
export async function resolveApiCaller(
	request: Request,
	brainId: string
): Promise<BrainApiCaller> {
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
	if (data.brain_id !== brainId) error(403, 'This API token belongs to a different brain');

	const brain = await getDomainBrain(supabase, brainId);
	if (brain === null) error(404, 'That expertise brain could not be found');

	await supabase
		.from('brain_api_tokens')
		.update({ last_used_at: new Date().toISOString() })
		.eq('id', data.id);
	return { supabase, brain, tokenHash };
}

function bearerToken(request: Request): string {
	const header = request.headers.get('authorization') ?? '';
	if (!header.toLowerCase().startsWith('bearer ')) return '';
	return header.slice(7).trim();
}
