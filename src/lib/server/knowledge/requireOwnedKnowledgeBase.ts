import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getKnowledgeBase, type KnowledgeBase } from './getKnowledgeBase';

// Viewers may read a shared knowledge base; only its owner may add to it.
export async function requireOwnedKnowledgeBase(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	userId: string
): Promise<KnowledgeBase> {
	const knowledgeBase = await getKnowledgeBase(supabase, knowledgeBaseId);
	if (knowledgeBase === null) error(404, 'That knowledge base could not be found');
	if (knowledgeBase.ownerId !== userId) error(403, 'Only the owner can add to this knowledge base');
	return knowledgeBase;
}
