import { inviteWindowStart } from '$lib/server/email/inviteAllowance';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function countChatbotInvitesThisHour(
	supabase: SupabaseClient,
	ownerId: string
): Promise<number> {
	const { count, error } = await supabase
		.from('chatbot_members')
		.select('id', { count: 'exact', head: true })
		.eq('owner_id', ownerId)
		.gte('created_at', inviteWindowStart());
	if (error !== null) throw error;
	return count ?? 0;
}
