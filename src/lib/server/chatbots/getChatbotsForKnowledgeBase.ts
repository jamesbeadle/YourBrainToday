import { selectChatbots, toChatbotSummary, type ChatbotRow } from './chatbotRows';
import type { ChatbotSummary } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getChatbotsForKnowledgeBase(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<ChatbotSummary[]> {
	const { data, error } = await selectChatbots(supabase)
		.eq('knowledge_base_id', knowledgeBaseId)
		.order('created_at');
	if (error !== null) throw error;
	return ((data ?? []) as unknown as ChatbotRow[]).map(toChatbotSummary);
}
