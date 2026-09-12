import { redirect } from '@sveltejs/kit';
import { getKnowledgeBase } from './getKnowledgeBase';
import { brainHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A brain filed in a knowledge base the caller can open lives on the brain route, not its workspace page. */
export async function redirectToFiledBrain(
	supabase: SupabaseClient,
	knowledgeBaseId: string | null,
	brainId: string
): Promise<void> {
	if (knowledgeBaseId === null) return;
	const knowledgeBase = await getKnowledgeBase(supabase, knowledgeBaseId);
	if (knowledgeBase === null) return;
	redirect(307, brainHref(knowledgeBaseId, brainId));
}
