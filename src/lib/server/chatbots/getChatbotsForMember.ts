import type { MemberChatbot } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

type MemberRow = {
	allowance_credits: number;
	spent_credits: number;
	chatbots: { id: string; name: string; is_paused: boolean } | null;
};

export async function getChatbotsForMember(
	supabase: SupabaseClient,
	userId: string
): Promise<MemberChatbot[]> {
	const { data, error } = await supabase
		.from('chatbot_members')
		.select('allowance_credits, spent_credits, chatbots(id, name, is_paused)')
		.eq('member_id', userId)
		.order('created_at');
	if (error !== null) throw error;
	return ((data ?? []) as unknown as MemberRow[])
		.filter((row) => row.chatbots !== null)
		.map((row) => ({
			id: row.chatbots!.id,
			name: row.chatbots!.name,
			allowanceCredits: row.allowance_credits,
			spentCredits: row.spent_credits,
			isPaused: row.chatbots!.is_paused
		}));
}
