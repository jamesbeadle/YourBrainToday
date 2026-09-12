import { error } from '@sveltejs/kit';
import { getChatbot } from './getChatbot';
import type { ChatbotSummary } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function requireOwnedChatbot(
	supabase: SupabaseClient,
	chatbotId: string,
	userId: string
): Promise<ChatbotSummary> {
	const chatbot = await getChatbot(supabase, chatbotId);
	if (chatbot === null || chatbot.ownerId !== userId) {
		error(404, 'That chatbot is not yours to manage');
	}
	return chatbot;
}
