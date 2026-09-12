import { selectChatbots, toChatbotSummary, type ChatbotRow } from './chatbotRows';
import type { ChatbotSummary } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type OwnedChatbotGroup = {
	knowledgeBaseId: string;
	knowledgeBaseName: string;
	chatbots: ChatbotSummary[];
};

// Every knowledge base the owner has, with its bots — a base with none still
// appears so the owner has somewhere to start one.
export async function getChatbotsForOwner(
	supabase: SupabaseClient,
	ownerId: string
): Promise<OwnedChatbotGroup[]> {
	const knowledgeBases = await ownedKnowledgeBases(supabase, ownerId);
	const chatbots = await ownedChatbots(supabase, ownerId);
	return knowledgeBases.map((knowledgeBase) => ({
		knowledgeBaseId: knowledgeBase.id,
		knowledgeBaseName: knowledgeBase.name,
		chatbots: chatbots.filter((chatbot) => chatbot.knowledgeBaseId === knowledgeBase.id)
	}));
}

async function ownedKnowledgeBases(
	supabase: SupabaseClient,
	ownerId: string
): Promise<{ id: string; name: string }[]> {
	const { data, error } = await supabase
		.from('knowledge_bases')
		.select('id, name')
		.eq('owner_id', ownerId)
		.eq('is_archived', false)
		.order('updated_at', { ascending: false });
	if (error !== null) throw error;
	return data ?? [];
}

async function ownedChatbots(supabase: SupabaseClient, ownerId: string): Promise<ChatbotSummary[]> {
	const { data, error } = await selectChatbots(supabase).eq('owner_id', ownerId).order('created_at');
	if (error !== null) throw error;
	return ((data ?? []) as unknown as ChatbotRow[]).map(toChatbotSummary);
}
