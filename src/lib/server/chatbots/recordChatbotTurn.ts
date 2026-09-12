import type { ChatbotAnswer } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

// Members can only read messages, so the server writes both sides of the
// exchange through the service client after the answer is in hand.
export async function recordChatbotTurn(
	supabase: SupabaseClient,
	conversationId: string,
	question: string,
	answer: ChatbotAnswer
): Promise<void> {
	const { error } = await supabase.from('chatbot_messages').insert([
		{ conversation_id: conversationId, speaker: 'member', body: question, cited_page_keys: [] },
		{
			conversation_id: conversationId,
			speaker: 'bot',
			body: answer.answerMarkdown,
			cited_page_keys: answer.citedPageKeys
		}
	]);
	if (error !== null) throw error;
	const { error: touchError } = await supabase
		.from('chatbot_conversations')
		.update({ last_message_at: new Date().toISOString() })
		.eq('id', conversationId);
	if (touchError !== null) throw touchError;
}
