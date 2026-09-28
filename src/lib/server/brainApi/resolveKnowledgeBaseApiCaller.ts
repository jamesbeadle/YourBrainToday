import { error } from '@sveltejs/kit';
import { findBrainFiling } from '$lib/server/knowledge/findBrainFiling';
import { getKnowledgeBase, type KnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';
import { resolveApiToken } from './resolveApiToken';
import type { SupabaseClient } from '@supabase/supabase-js';

export type KnowledgeBaseApiCaller = {
	supabase: SupabaseClient;
	knowledgeBase: KnowledgeBase;
};

// Authenticates one /api/v1/knowledge-bases request: a brain API token
// reaches the knowledge base its brain is filed in, and no other.
export async function resolveKnowledgeBaseApiCaller(
	request: Request,
	knowledgeBaseId: string
): Promise<KnowledgeBaseApiCaller> {
	const { supabase, brainId } = await resolveApiToken(request);
	const filing = await findBrainFiling(supabase, brainId);
	if (filing === null || filing.knowledgeBaseId !== knowledgeBaseId) {
		error(403, 'This API token belongs to a brain in a different knowledge base');
	}
	const knowledgeBase = await getKnowledgeBase(supabase, knowledgeBaseId);
	if (knowledgeBase === null || knowledgeBase.isArchived) {
		error(404, 'That knowledge base could not be found');
	}
	return { supabase, knowledgeBase };
}
