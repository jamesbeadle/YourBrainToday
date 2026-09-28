import { readExpertiseBrains, type ExpertiseBrainModel } from './readExpertiseBrains';
import { readExperienceEntries, type ExperienceEntry } from './readExperienceEntries';
import { readPeople, type HumanItem } from './readPeople';
import { readProcessMaps, type ProcessMap } from './readProcessMaps';
import { everyKnowledgeKind, type KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
import type { SupabaseClient } from '@supabase/supabase-js';

export type KnowledgeBaseReading = {
	kinds: KnowledgeKind[];
	expertise: ExpertiseBrainModel[];
	experience: ExperienceEntry[];
	processMaps: ProcessMap[];
	people: HumanItem[];
};

// The brains of a knowledge base as an agent reads them. Runs on the service
// client, so only once the caller has proved they may read the knowledge
// base: a chatbot member through the spend RPC, an API token filed in it, an
// MCP caller who owns it.
export async function readKnowledgeBase(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	kinds: KnowledgeKind[] = everyKnowledgeKind
): Promise<KnowledgeBaseReading> {
	const isWanted = (kind: KnowledgeKind) => kinds.includes(kind);
	const [expertise, experience, processMaps, people] = await Promise.all([
		isWanted('expertise') ? readExpertiseBrains(supabase, knowledgeBaseId) : [],
		isWanted('experience') ? readExperienceEntries(supabase, knowledgeBaseId) : [],
		isWanted('process') ? readProcessMaps(supabase, knowledgeBaseId) : [],
		isWanted('human') ? readPeople(supabase, knowledgeBaseId) : []
	]);
	return { kinds, expertise, experience, processMaps, people };
}
