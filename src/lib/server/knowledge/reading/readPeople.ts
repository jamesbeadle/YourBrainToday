import { knowledgeReadingCaps } from '$lib/data/knowledge/knowledgeReadingCaps';
import type { SupabaseClient } from '@supabase/supabase-js';

export type HumanItem = {
	itemKind: string;
	title: string;
	body: string;
	data: Record<string, unknown>;
};

const peopleCategory = 'people';

// Runs on the service client once the caller has proved they may read the
// knowledge base: the people and
// relationships across every human brain of the knowledge base.
export async function readPeople(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<HumanItem[]> {
	const { data, error } = await supabase
		.from('kb_brain_items')
		.select('item_kind, title, body, data, kb_brains!inner(knowledge_base_id, category)')
		.eq('kb_brains.knowledge_base_id', knowledgeBaseId)
		.eq('kb_brains.category', peopleCategory)
		.order('created_at', { ascending: false })
		.limit(knowledgeReadingCaps.mostHumanItems);
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		itemKind: row.item_kind as string,
		title: row.title as string,
		body: row.body as string,
		data: (row.data ?? {}) as Record<string, unknown>
	}));
}
