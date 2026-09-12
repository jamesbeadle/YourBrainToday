import type { SupabaseClient } from '@supabase/supabase-js';
import type { KnowledgeBaseSummary } from '$lib/data/knowledge/knowledgeTypes';

type KnowledgeBaseRow = {
	id: string;
	owner_id: string;
	name: string;
	description: string;
	is_archived: boolean;
	updated_at: string;
	kb_brains: { category: string }[];
};

export async function getKnowledgeBaseList(
	supabase: SupabaseClient
): Promise<KnowledgeBaseSummary[]> {
	const { data, error } = await supabase
		.from('knowledge_bases')
		.select('id, owner_id, name, description, is_archived, updated_at, kb_brains(category)')
		.order('updated_at', { ascending: false });
	if (error !== null) throw error;
	return ((data ?? []) as KnowledgeBaseRow[]).map(toSummary);
}

function toSummary(row: KnowledgeBaseRow): KnowledgeBaseSummary {
	const brains = row.kb_brains ?? [];
	return {
		id: row.id,
		ownerId: row.owner_id,
		name: row.name,
		description: row.description,
		isArchived: row.is_archived,
		domainBrainCount: brains.filter((brain) => brain.category === 'domain').length,
		instanceBrainCount: brains.filter((brain) => brain.category === 'instance').length,
		updatedAt: row.updated_at
	};
}
