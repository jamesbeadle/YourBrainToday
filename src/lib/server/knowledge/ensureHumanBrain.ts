import { createKbBrain } from './createKbBrain';
import { storedBrainBlueprints } from '$lib/data/knowledge/storedBrainBlueprints';
import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

type KnowledgeBaseNaming = { id: string; name: string };

function hasHumanBrain(brains: KbBrainSummary[]): boolean {
	return brains.some((brain) => brain.category === storedBrainBlueprints.human.category);
}

async function createHumanBrain(
	supabase: SupabaseClient,
	knowledgeBase: KnowledgeBaseNaming
): Promise<void> {
	await createKbBrain(supabase, {
		knowledgeBaseId: knowledgeBase.id,
		...storedBrainBlueprints.human,
		name: `${knowledgeBase.name} People`,
		description: `The people around ${knowledgeBase.name}, and how well they get on.`
	});
}

/**
 * Knowledge bases made before the Human brain existed never had one seeded.
 * A failure is logged rather than thrown — most likely migration 0052 is not
 * yet applied — so the knowledge base still opens, offering to add one.
 * Returns whether a brain was created, so the caller can reload its list.
 */
export async function ensureHumanBrain(
	supabase: SupabaseClient,
	knowledgeBase: KnowledgeBaseNaming,
	brains: KbBrainSummary[]
): Promise<boolean> {
	if (hasHumanBrain(brains)) return false;
	try {
		await createHumanBrain(supabase, knowledgeBase);
		return true;
	} catch (failure) {
		console.error('Could not add a Human brain — is migration 0052 applied?', failure);
		return false;
	}
}
