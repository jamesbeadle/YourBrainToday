import type { ChatbotMessage } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatbotConversation = { id: string; messages: ChatbotMessage[] };

// Each member has one conversation per bot, created on first sight. Runs as
// the member: the insert policy stamps member_id from auth.uid().
export async function getChatbotConversation(
	supabase: SupabaseClient,
	chatbotId: string,
	userId: string
): Promise<ChatbotConversation> {
	const id = await findOrCreateConversation(supabase, chatbotId, userId);
	const { data, error } = await supabase
		.from('chatbot_messages')
		.select('id, speaker, body, cited_page_keys, created_at')
		.eq('conversation_id', id)
		.order('created_at');
	if (error !== null) throw error;
	return {
		id,
		messages: (data ?? []).map((row) => ({
			id: row.id,
			speaker: row.speaker,
			body: row.body,
			citedPageKeys: row.cited_page_keys ?? [],
			createdAt: row.created_at
		}))
	};
}

async function findOrCreateConversation(
	supabase: SupabaseClient,
	chatbotId: string,
	userId: string
): Promise<string> {
	const { data, error } = await supabase
		.from('chatbot_conversations')
		.select('id')
		.eq('chatbot_id', chatbotId)
		.eq('member_id', userId)
		.order('created_at')
		.limit(1)
		.maybeSingle();
	if (error !== null) throw error;
	if (data !== null) return data.id;
	const { data: created, error: createError } = await supabase
		.from('chatbot_conversations')
		.insert({ chatbot_id: chatbotId, member_id: userId })
		.select('id')
		.single();
	if (createError !== null) throw createError;
	return created.id;
}
