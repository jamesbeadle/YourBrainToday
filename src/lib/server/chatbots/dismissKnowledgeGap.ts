import type { SupabaseClient } from '@supabase/supabase-js';

export async function dismissKnowledgeGap(
	supabase: SupabaseClient,
	chatbotId: string,
	gapId: string
): Promise<void> {
	const { error } = await supabase
		.from('chatbot_knowledge_gaps')
		.update({ status: 'dismissed', resolved_at: new Date().toISOString() })
		.eq('id', gapId)
		.eq('chatbot_id', chatbotId)
		.eq('status', 'open');
	if (error !== null) throw error;
}
