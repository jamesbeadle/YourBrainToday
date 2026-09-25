import { experienceLogLine, harvestSourceExperience } from './harvestSourceExperience';
import { harvestSourcePeople, peopleLogLine } from './harvestSourcePeople';
import { mapSourceProcess, processLogLine } from './mapSourceProcess';
import type { StoredBrainSource } from './findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export type SourceRouting = {
	logLine: string;
	experienceEpisodes: number;
	processTasks: number;
	humanConnections: number;
};

export async function routeSourceToBrains(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	contentBlock: unknown
): Promise<SourceRouting> {
	const [experience, process, people] = await Promise.all([
		harvestSourceExperience(supabase, source, contentBlock),
		mapSourceProcess(supabase, source, contentBlock),
		harvestSourcePeople(supabase, source, contentBlock)
	]);
	return {
		logLine: `${experienceLogLine(experience)}${processLogLine(process)}${peopleLogLine(people)}`,
		experienceEpisodes: experience.filedCount,
		processTasks: process.tasksAdded,
		humanConnections: people.connectionCount
	};
}
