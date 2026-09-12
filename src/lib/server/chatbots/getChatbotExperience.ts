import { chatbotKnowledgeCaps } from '$lib/data/chatbotKnowledgeCaps';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatbotExperienceItem = {
	brainName: string;
	title: string;
	body: string;
	occurredAt: string | null;
};

const instanceCategory = 'instance';

type ExperienceRow = {
	title: string;
	body: string;
	occurred_at: string | null;
	kb_brains: { name: string } | { name: string }[] | null;
};

// Runs on the service client after membership is proven: the most recent
// entries across every experience brain of the knowledge base.
export async function getChatbotExperience(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<ChatbotExperienceItem[]> {
	const { data, error } = await supabase
		.from('kb_brain_items')
		.select('title, body, occurred_at, created_at, kb_brains!inner(name, knowledge_base_id, category)')
		.eq('kb_brains.knowledge_base_id', knowledgeBaseId)
		.eq('kb_brains.category', instanceCategory)
		.order('occurred_at', { ascending: false, nullsFirst: false })
		.order('created_at', { ascending: false })
		.limit(chatbotKnowledgeCaps.mostExperienceItems);
	if (error !== null) throw error;
	return ((data ?? []) as unknown as ExperienceRow[]).map((row) => ({
		brainName: brainNameFrom(row.kb_brains),
		title: row.title,
		body: row.body,
		occurredAt: row.occurred_at
	}));
}

function brainNameFrom(brain: ExperienceRow['kb_brains']): string {
	if (brain === null) return '';
	if (Array.isArray(brain)) return brain[0]?.name ?? '';
	return brain.name;
}
