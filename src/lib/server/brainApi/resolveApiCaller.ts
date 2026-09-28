import { error } from '@sveltejs/kit';
import { getDomainBrain, type DomainBrain } from '$lib/server/entities/getDomainBrain';
import { resolveApiToken } from './resolveApiToken';
import type { SupabaseClient } from '@supabase/supabase-js';

export type BrainApiCaller = {
	supabase: SupabaseClient;
	brain: DomainBrain;
	tokenHash: string;
};

// Authenticates one /api/v1/brains request: the token must have been minted
// for exactly the brain in the path. Returns a service-role client — every
// read it performs is pinned to the resolved brain id.
export async function resolveApiCaller(
	request: Request,
	brainId: string
): Promise<BrainApiCaller> {
	const { supabase, brainId: tokenBrainId, tokenHash } = await resolveApiToken(request);
	if (tokenBrainId !== brainId) error(403, 'This API token belongs to a different brain');
	const brain = await getDomainBrain(supabase, brainId);
	if (brain === null) error(404, 'That expertise brain could not be found');
	return { supabase, brain, tokenHash };
}
