import { chatbotKnowledgeCaps } from '$lib/data/chatbotKnowledgeCaps';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatbotHumanItem = {
	itemKind: string;
	title: string;
	body: string;
	data: Record<string, unknown>;
};

const peopleCategory = 'people';

// Runs on the service client after membership is proven: the people and
// relationships across every human brain of the knowledge base.
export async function getChatbotPeople(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<ChatbotHumanItem[]> {
	const { data, error } = await supabase
		.from('kb_brain_items')
		.select('item_kind, title, body, data, kb_brains!inner(knowledge_base_id, category)')
		.eq('kb_brains.knowledge_base_id', knowledgeBaseId)
		.eq('kb_brains.category', peopleCategory)
		.order('created_at', { ascending: false })
		.limit(chatbotKnowledgeCaps.mostHumanItems);
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		itemKind: row.item_kind as string,
		title: row.title as string,
		body: row.body as string,
		data: (row.data ?? {}) as Record<string, unknown>
	}));
}
