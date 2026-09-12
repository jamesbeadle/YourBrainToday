import { spendWindowStart } from '$lib/server/credits/recentSpendCount';
import type { SupabaseClient } from '@supabase/supabase-js';

const memberSpeaker = 'member';

// A member's questions land as their own messages in their conversations,
// so those are the record of what the pool has paid for on their behalf.
export async function countRecentMemberQuestions(
	supabase: SupabaseClient,
	memberId: string
): Promise<number> {
	const { count, error } = await supabase
		.from('chatbot_messages')
		.select('id, chatbot_conversations!inner(member_id)', { count: 'exact', head: true })
		.eq('chatbot_conversations.member_id', memberId)
		.eq('speaker', memberSpeaker)
		.gte('created_at', spendWindowStart());
	if (error !== null) throw error;
	return count ?? 0;
}
