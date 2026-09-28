import { emailOf, memberEmailsFor } from './chatbotMemberEmails';
import { pairExchanges, type LoggedMessage, type PairedExchange } from './pairExchanges';
import { readTheSame } from '$lib/data/comparableWording';
import { mostExchangesShown, type ChatbotExchange } from '$lib/data/chatbotQuestionLog';
import type { ChatbotRuling } from '$lib/data/chatbotRulings';
import type { ChatbotSpeaker } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

type MessageRow = {
	id: string;
	conversation_id: string;
	speaker: ChatbotSpeaker;
	body: string;
	cited_page_keys: string[] | null;
	created_at: string;
	chatbot_conversations: { member_id: string } | { member_id: string }[] | null;
};

const messagesPerExchange = 2;

// Reads as the owner: the policies in 0055 open their bots' conversations
// to them. Every exchange is what the member saw, so the log is the record.
export async function getChatbotQuestionLog(
	supabase: SupabaseClient,
	chatbotId: string,
	rulings: ChatbotRuling[]
): Promise<ChatbotExchange[]> {
	const emailsByMember = await memberEmailsFor(supabase, chatbotId);
	const messages = await loggedMessagesFor(supabase, chatbotId);
	return pairExchanges(messages)
		.slice(0, mostExchangesShown)
		.map((exchange) => toChatbotExchange(exchange, emailsByMember, rulings));
}

async function loggedMessagesFor(supabase: SupabaseClient, chatbotId: string): Promise<LoggedMessage[]> {
	const { data, error } = await supabase
		.from('chatbot_messages')
		.select('id, conversation_id, speaker, body, cited_page_keys, created_at, chatbot_conversations!inner(chatbot_id, member_id)')
		.eq('chatbot_conversations.chatbot_id', chatbotId)
		.order('created_at', { ascending: false })
		.limit(mostExchangesShown * messagesPerExchange);
	if (error !== null) throw error;
	return ((data ?? []) as unknown as MessageRow[]).map((row) => ({
		id: row.id,
		conversationId: row.conversation_id,
		memberId: memberIdFrom(row.chatbot_conversations),
		speaker: row.speaker,
		body: row.body,
		citedPageKeys: row.cited_page_keys ?? [],
		createdAt: row.created_at
	}));
}

function memberIdFrom(conversation: MessageRow['chatbot_conversations']): string {
	if (conversation === null) return '';
	if (Array.isArray(conversation)) return conversation[0]?.member_id ?? '';
	return conversation.member_id;
}

function toChatbotExchange(
	exchange: PairedExchange,
	emailsByMember: Map<string, string>,
	rulings: ChatbotRuling[]
): ChatbotExchange {
	return {
		id: exchange.id,
		askedByEmail: emailOf(exchange.memberId, emailsByMember),
		question: exchange.question,
		answerMarkdown: exchange.answerMarkdown,
		citedPageKeys: exchange.citedPageKeys,
		askedAt: exchange.askedAt,
		hasPreferredAnswer: rulings.some((ruling) => readTheSame(ruling.question, exchange.question))
	};
}
