import { getBrainPageIndex } from './getBrainPageIndex';
import { harvestDocumentEvents } from './harvestDocumentEvents';
import { fileExperienceEvents } from '$lib/server/knowledge/experienceWriter';
import { findBrainFiling } from '$lib/server/knowledge/findBrainFiling';
import { forgetDocumentEpisodes } from '$lib/server/knowledge/forgetDocumentEpisodes';
import { findOrCreateHarvestBrain } from '$lib/server/agent/harvestBrains';
import { harvestCreditsFor } from '$lib/data/creditPricing';
import { spendCredits } from '$lib/server/credits/spendCredits';
import type { StoredBrainSource } from './findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ExperienceHarvest = { filedCount: number; outcome: 'filed' | 'unfiled' | 'failed' };

export async function harvestSourceExperience(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	contentBlock: unknown
): Promise<ExperienceHarvest> {
	const filing = await findBrainFiling(supabase, source.brainId);
	if (filing === null) return { filedCount: 0, outcome: 'unfiled' };
	try {
		const filedCount = await fileDocumentExperience(supabase, source, contentBlock, filing);
		return { filedCount, outcome: 'filed' };
	} catch (failure) {
		console.error('Experience harvest failed', source.filename, failure);
		return { filedCount: 0, outcome: 'failed' };
	}
}

export function experienceLogLine(harvest: ExperienceHarvest): string {
	if (harvest.outcome === 'unfiled') return '';
	if (harvest.outcome === 'failed') return ' Experience harvest failed — re-read to try again.';
	if (harvest.filedCount === 0) return ' No experience to file.';
	const noun = harvest.filedCount === 1 ? 'episode' : 'episodes';
	return ` Filed ${harvest.filedCount} ${noun} to the experience brain.`;
}

async function fileDocumentExperience(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	contentBlock: unknown,
	filing: { knowledgeBaseId: string; knowledgeBaseName: string }
): Promise<number> {
	const pageIndex = await getBrainPageIndex(supabase, source.brainId);
	const knownTerms = pageIndex.map((page) => page.title);
	const events = await harvestDocumentEvents(
		contentBlock,
		source.filename,
		filing.knowledgeBaseName,
		knownTerms
	);
	const eventsBrainId = await findOrCreateHarvestBrain(
		supabase,
		filing.knowledgeBaseId,
		'episodic_log'
	);
	await forgetDocumentEpisodes(supabase, eventsBrainId, source.filename);
	if (events.length === 0) return 0;
	await fileExperienceEvents(supabase, eventsBrainId, events, knownTerms, source.filename);
	await spendCredits(supabase, harvestCreditsFor(events.length), 'knowledge_harvest');
	return events.length;
}
