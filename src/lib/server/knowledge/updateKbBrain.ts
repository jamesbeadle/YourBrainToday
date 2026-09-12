import type { SupabaseClient } from '@supabase/supabase-js';
import type { RetrievalConfig } from '$lib/data/knowledge/knowledgeTypes';

type KbBrainChanges = {
	name?: string;
	description?: string;
	retrievalConfig?: RetrievalConfig;
};

export async function updateKbBrain(
	supabase: SupabaseClient,
	brainId: string,
	changes: KbBrainChanges
): Promise<void> {
	const { error } = await supabase
		.from('kb_brains')
		.update({
			...(changes.name === undefined ? {} : { name: changes.name }),
			...(changes.description === undefined ? {} : { description: changes.description }),
			...(changes.retrievalConfig === undefined
				? {}
				: { retrieval_config: changes.retrievalConfig }),
			updated_at: new Date().toISOString()
		})
		.eq('id', brainId);
	if (error !== null) throw error;
}
