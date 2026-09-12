import { error } from '@sveltejs/kit';
import { loadExperienceBrainView, type ExperienceBrainView } from './loadExperienceBrainView';
import { loadExpertiseBrainView, type ExpertiseBrainView } from './loadExpertiseBrainView';
import { loadProcessBrainView, type ProcessBrainView } from './loadProcessBrainView';
import type { OpenBrain } from '$lib/data/knowledge/findOpenBrain';
import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type BrainView = ExpertiseBrainView | ExperienceBrainView | ProcessBrainView;

/** Each kind of brain has its own view and its own loader; the open brain says which. */
export async function loadBrainView(
	supabase: SupabaseClient,
	userId: string,
	openBrain: OpenBrain,
	knowledgeBaseBrains: KbBrainSummary[]
): Promise<BrainView> {
	if (openBrain.kind.kind === 'process') return loadProcessBrainView(supabase, openBrain.id);
	const storedBrain = knowledgeBaseBrains.find((brain) => brain.id === openBrain.id);
	if (storedBrain === undefined) error(404, 'That brain is not in this knowledge base');
	if (openBrain.kind.kind === 'expertise') {
		return loadExpertiseBrainView(supabase, storedBrain, userId);
	}
	return loadExperienceBrainView(supabase, storedBrain, knowledgeBaseBrains);
}
