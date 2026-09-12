import type { SupabaseClient } from '@supabase/supabase-js';

export async function markKnowledgeGapAnswered(
	supabase: SupabaseClient,
	gapId: string,
	answer: string,
	sourceId: string
): Promise<void> {
	const { error } = await supabase
		.from('chatbot_knowledge_gaps')
		.update({
			status: 'answered',
			answer,
			source_id: sourceId,
			resolved_at: new Date().toISOString()
		})
		.eq('id', gapId);
	if (error !== null) throw error;
}
