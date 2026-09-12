import { experienceLogLine, harvestSourceExperience } from './harvestSourceExperience';
import { mapSourceProcess, processLogLine } from './mapSourceProcess';
import type { StoredBrainSource } from './findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export type SourceRouting = { logLine: string; experienceEpisodes: number; processTasks: number };

export async function routeSourceToBrains(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	contentBlock: unknown
): Promise<SourceRouting> {
	const experience = await harvestSourceExperience(supabase, source, contentBlock);
	const process = await mapSourceProcess(supabase, source, contentBlock);
	return {
		logLine: `${experienceLogLine(experience)}${processLogLine(process)}`,
		experienceEpisodes: experience.filedCount,
		processTasks: process.tasksAdded
	};
}
