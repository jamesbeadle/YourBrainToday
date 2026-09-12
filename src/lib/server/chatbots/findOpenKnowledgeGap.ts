import type { SupabaseClient } from '@supabase/supabase-js';

export type OpenKnowledgeGap = { id: string; question: string; missingKnowledge: string };

export async function findOpenKnowledgeGap(
	supabase: SupabaseClient,
	chatbotId: string,
	gapId: string
): Promise<OpenKnowledgeGap | null> {
	const { data, error } = await supabase
		.from('chatbot_knowledge_gaps')
		.select('id, question, missing_knowledge')
		.eq('id', gapId)
		.eq('chatbot_id', chatbotId)
		.eq('status', 'open')
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return { id: data.id, question: data.question, missingKnowledge: data.missing_knowledge };
}
