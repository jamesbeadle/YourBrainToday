import type { ChatbotTopUp } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getChatbotTopUps(
	supabase: SupabaseClient,
	chatbotId: string
): Promise<ChatbotTopUp[]> {
	const { data, error } = await supabase
		.from('chatbot_top_ups')
		.select('id, credits, created_at')
		.eq('chatbot_id', chatbotId)
		.order('created_at', { ascending: false });
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		id: row.id,
		credits: row.credits,
		createdAt: row.created_at
	}));
}
