import { selectChatbots, toChatbotSummary, type ChatbotRow } from './chatbotRows';
import type { ChatbotSummary } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

// RLS decides who sees a bot: its owner, or a member who has joined.
export async function getChatbot(
	supabase: SupabaseClient,
	chatbotId: string
): Promise<ChatbotSummary | null> {
	const { data, error } = await selectChatbots(supabase).eq('id', chatbotId).maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return toChatbotSummary(data as unknown as ChatbotRow);
}
