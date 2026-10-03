import { getBrainPageIndex } from './getBrainPageIndex';
import { harvestDocumentEvents } from './harvestDocumentEvents';
import { fileExperienceEvents } from '$lib/server/knowledge/experienceWriter';
import { findBrainFiling } from '$lib/server/knowledge/findBrainFiling';
import { forgetDocumentEpisodes } from '$lib/server/knowledge/forgetDocumentEpisodes';
import { findOrCreateHarvestBrain } from '$lib/server/agent/harvestBrains';
import type { StoredBrainSource } from './findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ExperienceHarvest = { filedCount: number; outcome: 'filed' | 'unfiled' };

/**
 * What happened in the source, filed as episodes in the experience brain.
 * The source's earlier episodes are forgotten first, so reading it again
 * replaces rather than repeats them.
 */
export async function harvestSourceExperience(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	contentBlock: unknown
): Promise<ExperienceHarvest> {
	const filing = await findBrainFiling(supabase, source.brainId);
	if (filing === null) return { filedCount: 0, outcome: 'unfiled' };
	const pageIndex = await getBrainPageIndex(supabase, source.brainId);
	const knownTerms = pageIndex.map((page) => page.title);
	const events = await harvestDocumentEvents(
		contentBlock,
		source.filename,
		filing.knowledgeBaseName,
		knownTerms
	);
	const eventsBrainId = await findOrCreateHarvestBrain(supabase, filing.knowledgeBaseId, 'episodic_log');
	await forgetDocumentEpisodes(supabase, eventsBrainId, source);
	if (events.length === 0) return { filedCount: 0, outcome: 'filed' };
	await fileExperienceEvents(supabase, eventsBrainId, events, knownTerms, {
		label: source.filename,
		sourceId: source.id
	});
	return { filedCount: events.length, outcome: 'filed' };
}

export function experienceLogLine(harvest: ExperienceHarvest): string {
	if (harvest.outcome === 'unfiled') return '';
	if (harvest.filedCount === 0) return ' No experience to file.';
	const noun = harvest.filedCount === 1 ? 'episode' : 'episodes';
	return ` Filed ${harvest.filedCount} ${noun} to the experience brain.`;
}
