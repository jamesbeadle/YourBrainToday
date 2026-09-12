import type { SupabaseClient } from '@supabase/supabase-js';
import { defaultRetrievalConfigFor } from '$lib/data/knowledge/brainTypeCatalog';
import type { BrainCategory, BrainType } from '$lib/data/knowledge/knowledgeTypes';

type NewKbBrain = {
	knowledgeBaseId: string;
	category: BrainCategory;
	brainType: BrainType;
	name: string;
	description: string;
	domainBrainId?: string;
};

export async function createKbBrain(supabase: SupabaseClient, brain: NewKbBrain): Promise<string> {
	const { data, error } = await supabase
		.from('kb_brains')
		.insert({
			knowledge_base_id: brain.knowledgeBaseId,
			category: brain.category,
			brain_type: brain.brainType,
			name: brain.name,
			description: brain.description,
			retrieval_config: defaultRetrievalConfigFor(brain.brainType),
			domain_brain_id: brain.domainBrainId ?? null
		})
		.select('id')
		.single();
	if (error !== null) throw error;
	return data.id;
}
