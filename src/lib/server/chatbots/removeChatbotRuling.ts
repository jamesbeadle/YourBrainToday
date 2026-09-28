import type { SupabaseClient } from '@supabase/supabase-js';

export async function removeChatbotRuling(
	supabase: SupabaseClient,
	chatbotId: string,
	rulingId: string
): Promise<void> {
	const { error } = await supabase
		.from('chatbot_rulings')
		.delete()
		.eq('id', rulingId)
		.eq('chatbot_id', chatbotId);
	if (error !== null) throw error;
}
