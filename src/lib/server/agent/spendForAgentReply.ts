import type { SupabaseClient } from '@supabase/supabase-js';

export type ReplySpend = { creditBalance: number } | 'insufficient_credits' | 'account_restricted';

export async function spendForAgentReply(
	supabase: SupabaseClient,
	sessionId: string
): Promise<ReplySpend> {
	const { data, error } = await supabase.rpc('spend_for_agent_reply', {
		session_identifier: sessionId
	});
	if (error === null) return { creditBalance: data };
	if (error.message.includes('insufficient_credits')) return 'insufficient_credits';
	if (error.message.includes('account_restricted')) return 'account_restricted';
	throw error;
}
