import type { SupabaseClient } from '@supabase/supabase-js';
import { parseRetrievalConfig } from '$lib/data/knowledge/retrievalConfig';
import type { BrainCategory, BrainType, KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';

export type KbBrainRow = {
	id: string;
	knowledge_base_id: string;
	category: string;
	brain_type: string;
	name: string;
	description: string;
	retrieval_config: Record<string, unknown> | null;
	domain_brain_id: string | null;
	updated_at: string;
};

export const kbBrainColumns =
	'id, knowledge_base_id, category, brain_type, name, description, retrieval_config, domain_brain_id, updated_at';

export function toKbBrainSummary(row: KbBrainRow): KbBrainSummary {
	return {
		id: row.id,
		knowledgeBaseId: row.knowledge_base_id,
		category: row.category as BrainCategory,
		brainType: row.brain_type as BrainType,
		name: row.name,
		description: row.description,
		retrievalConfig: parseRetrievalConfig(row.brain_type as BrainType, row.retrieval_config),
		domainBrainId: row.domain_brain_id,
		updatedAt: row.updated_at
	};
}

export async function getKbBrains(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<KbBrainSummary[]> {
	const { data, error } = await supabase
		.from('kb_brains')
		.select(kbBrainColumns)
		.eq('knowledge_base_id', knowledgeBaseId)
		.order('created_at');
	if (error !== null) throw error;
	return ((data ?? []) as KbBrainRow[]).map(toKbBrainSummary);
}
