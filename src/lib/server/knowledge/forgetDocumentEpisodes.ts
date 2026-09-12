import { findBrainFiling } from './findBrainFiling';
import { findHarvestBrain } from '$lib/server/agent/harvestBrains';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function forgetDocumentEpisodes(
	supabase: SupabaseClient,
	eventsBrainId: string,
	filename: string
): Promise<void> {
	const { error } = await supabase
		.from('kb_brain_items')
		.delete()
		.eq('brain_id', eventsBrainId)
		.eq('item_kind', 'episode')
		.eq('data->>provenance', filename);
	if (error !== null) throw error;
}

export async function forgetSourceEpisodes(
	supabase: SupabaseClient,
	domainBrainId: string,
	filename: string
): Promise<void> {
	const filing = await findBrainFiling(supabase, domainBrainId);
	if (filing === null) return;
	const eventsBrainId = await findHarvestBrain(supabase, filing.knowledgeBaseId, 'episodic_log');
	if (eventsBrainId === null) return;
	await forgetDocumentEpisodes(supabase, eventsBrainId, filename);
}
