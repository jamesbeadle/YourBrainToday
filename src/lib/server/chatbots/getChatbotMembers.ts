import type { ChatbotMember } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getChatbotMembers(
	supabase: SupabaseClient,
	chatbotId: string
): Promise<ChatbotMember[]> {
	const { data, error } = await supabase
		.from('chatbot_members')
		.select('id, invited_email, member_id, model_id, allowance_credits, spent_credits, joined_at')
		.eq('chatbot_id', chatbotId)
		.order('created_at');
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		id: row.id,
		invitedEmail: row.invited_email,
		hasJoined: row.member_id !== null,
		modelId: row.model_id,
		allowanceCredits: row.allowance_credits,
		spentCredits: row.spent_credits,
		joinedAt: row.joined_at
	}));
}
