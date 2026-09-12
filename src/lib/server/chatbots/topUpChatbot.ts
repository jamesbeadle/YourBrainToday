import type { MemberAllowance } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatbotTopUpOutcome =
	| { poolCredits: number }
	| 'insufficient_credits'
	| 'account_restricted';

export async function topUpChatbot(
	supabase: SupabaseClient,
	chatbotId: string,
	credits: number,
	allowances: MemberAllowance[]
): Promise<ChatbotTopUpOutcome> {
	const { data, error } = await supabase.rpc('top_up_chatbot', {
		target_chatbot: chatbotId,
		credit_amount: credits,
		member_allowances: allowances
	});
	if (error === null) return { poolCredits: data };
	if (error.message.includes('insufficient_credits')) return 'insufficient_credits';
	if (error.message.includes('account_restricted')) return 'account_restricted';
	throw error;
}
