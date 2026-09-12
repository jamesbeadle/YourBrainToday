import type { ChatbotSummary, KnowledgeGapStatus } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatbotRow = {
	id: string;
	knowledge_base_id: string;
	owner_id: string;
	name: string;
	pool_credits: number;
	is_paused: boolean;
	model_id: string;
	created_at: string;
	chatbot_members: { count: number }[];
	chatbot_knowledge_gaps: { count: number }[];
};

const chatbotColumns =
	'id, knowledge_base_id, owner_id, name, pool_credits, is_paused, model_id, created_at, ' +
	'chatbot_members(count), chatbot_knowledge_gaps(count)';

const openGapStatus: KnowledgeGapStatus = 'open';

// The gap count only counts questions still open; members, who cannot read
// gaps at all, simply see zero.
export function selectChatbots(supabase: SupabaseClient) {
	return supabase
		.from('chatbots')
		.select(chatbotColumns)
		.eq('chatbot_knowledge_gaps.status', openGapStatus);
}

export function toChatbotSummary(row: ChatbotRow): ChatbotSummary {
	return {
		id: row.id,
		knowledgeBaseId: row.knowledge_base_id,
		ownerId: row.owner_id,
		name: row.name,
		poolCredits: row.pool_credits,
		isPaused: row.is_paused,
		modelId: row.model_id,
		memberCount: row.chatbot_members[0]?.count ?? 0,
		openQuestionCount: row.chatbot_knowledge_gaps[0]?.count ?? 0,
		createdAt: row.created_at
	};
}
