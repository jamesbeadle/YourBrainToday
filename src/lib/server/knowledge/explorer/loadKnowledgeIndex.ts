import { indexBrainItems } from './indexBrainItems';
import { indexExpertisePages } from './indexExpertisePages';
import { indexProcessTasks } from './indexProcessTasks';
import type { KnowledgeIndexEntry } from '$lib/data/knowledge/knowledgeIndex';
import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
import type { ProcessMapSummary } from '../getProcessMaps';
import type { SupabaseClient } from '@supabase/supabase-js';

/** One flat index across every brain of a knowledge base, as whoever holds the client may read it. */
export async function loadKnowledgeIndex(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	brains: KbBrainSummary[],
	processMaps: ProcessMapSummary[]
): Promise<KnowledgeIndexEntry[]> {
	const entryLists = await Promise.all([
		...brains.map((brain) => indexBrain(supabase, brain)),
		...processMaps.map((processMap) => indexProcessTasks(supabase, knowledgeBaseId, processMap))
	]);
	return entryLists.flat();
}

function indexBrain(supabase: SupabaseClient, brain: KbBrainSummary): Promise<KnowledgeIndexEntry[]> {
	if (brain.category === 'domain') return indexExpertisePages(supabase, brain);
	return indexBrainItems(supabase, brain);
}
