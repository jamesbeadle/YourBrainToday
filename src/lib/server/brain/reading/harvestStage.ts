import { chargeHarvest } from './readingPayments';
import { loadSourceContent } from './loadSourceContent';
import { experienceLogLine, harvestSourceExperience } from '../harvestSourceExperience';
import { harvestSourcePeople, peopleLogLine } from '../harvestSourcePeople';
import { mapSourceProcess, processLogLine } from '../mapSourceProcess';
import type { ReadingProgress, ReadingStage } from '$lib/data/sourceReading';
import type { StoredBrainSource } from '../findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export type HarvestStage = Exclude<ReadingStage, 'model'>;

type HarvestResult = { progress: Partial<ReadingProgress>; logLine: string; chargedItems: number };

type HarvestRunner = (
	supabase: SupabaseClient,
	source: StoredBrainSource,
	contentBlock: unknown,
	ownerId: string
) => Promise<HarvestResult>;

const harvestRunners: Record<HarvestStage, HarvestRunner> = {
	experience: async (supabase, source, contentBlock) => {
		const harvest = await harvestSourceExperience(supabase, source, contentBlock);
		return {
			progress: { episodes: harvest.filedCount },
			logLine: experienceLogLine(harvest),
			chargedItems: harvest.filedCount
		};
	},
	process: async (supabase, source, contentBlock, ownerId) => {
		const mapping = await mapSourceProcess(supabase, source, contentBlock, ownerId);
		return {
			progress: { processTasks: mapping.tasksAdded },
			logLine: processLogLine(mapping),
			chargedItems: mapping.tasksAdded
		};
	},
	people: async (supabase, source, contentBlock) => {
		const harvest = await harvestSourcePeople(supabase, source, contentBlock);
		return {
			progress: { people: harvest.personCount, connections: harvest.connectionCount },
			logLine: peopleLogLine(harvest),
			chargedItems: harvest.personCount + harvest.connectionCount
		};
	}
};

/**
 * One harvest stage: the source is read again by the brain the stage names,
 * what it files is counted and the owner is charged for the items filed.
 * Each stage reads the file afresh so no stage depends on another's memory.
 */
export async function runHarvestStage(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	stage: HarvestStage,
	ownerId: string
): Promise<Partial<ReadingProgress>> {
	const content = await loadSourceContent(supabase, source);
	const result = await harvestRunners[stage](supabase, source, content.contentBlock, ownerId);
	await chargeHarvest(ownerId, result.chargedItems);
	return { ...result.progress, logLine: `${source.progress.logLine}${result.logLine}` };
}
