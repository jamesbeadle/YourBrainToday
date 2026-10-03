import { findBrainFiling } from './findBrainFiling';
import { findHarvestBrain } from '$lib/server/agent/harvestBrains';
import type { SupabaseClient } from '@supabase/supabase-js';

type ForgottenSource = { id: string; filename: string };

/**
 * The episodes one source filed. Episodes filed since sources were known by
 * id are matched by id; older ones, filed under the filename alone, are
 * matched by that name only when no id was ever recorded on them.
 */
export async function forgetDocumentEpisodes(
	supabase: SupabaseClient,
	eventsBrainId: string,
	source: ForgottenSource
): Promise<void> {
	const bySourceId = await supabase
		.from('kb_brain_items')
		.delete()
		.eq('brain_id', eventsBrainId)
		.eq('item_kind', 'episode')
		.eq('data->>sourceId', source.id);
	if (bySourceId.error !== null) throw bySourceId.error;
	const byLegacyFilename = await supabase
		.from('kb_brain_items')
		.delete()
		.eq('brain_id', eventsBrainId)
		.eq('item_kind', 'episode')
		.eq('data->>provenance', source.filename)
		.is('data->>sourceId', null);
	if (byLegacyFilename.error !== null) throw byLegacyFilename.error;
}

export async function forgetSourceEpisodes(
	supabase: SupabaseClient,
	domainBrainId: string,
	source: ForgottenSource
): Promise<void> {
	const filing = await findBrainFiling(supabase, domainBrainId);
	if (filing === null) return;
	const eventsBrainId = await findHarvestBrain(supabase, filing.knowledgeBaseId, 'episodic_log');
	if (eventsBrainId === null) return;
	await forgetDocumentEpisodes(supabase, eventsBrainId, source);
}
