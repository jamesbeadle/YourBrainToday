import { askChatbot, type ChatbotTurn } from './askChatbot';
import { readChatbotRulings } from './readChatbotRulings';
import { rememberForChatbot } from './rememberForChatbot';
import { readKnowledgeBase } from '../knowledge/reading/readKnowledgeBase';
import { isRememberRequest } from '$lib/data/rememberRequest';
import type { ChatProposer } from '../sharing/proposeChatCorrection';
import type { ChatbotAnswer } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type AnsweringChatbot = { id: string; name: string; knowledgeBaseId: string; modelId: string };

export async function replyAsChatbot(
	service: SupabaseClient,
	chatbot: AnsweringChatbot,
	member: ChatProposer,
	turns: ChatbotTurn[]
): Promise<ChatbotAnswer> {
	const latest = turns[turns.length - 1];
	if (isRememberRequest(latest.text)) return rememberForChatbot(service, chatbot, member, turns);
	const knowledge = await readKnowledgeBase(service, chatbot.knowledgeBaseId);
	const rulings = await readChatbotRulings(service, chatbot.id);
	return askChatbot(service, chatbot, knowledge, rulings, turns);
}
