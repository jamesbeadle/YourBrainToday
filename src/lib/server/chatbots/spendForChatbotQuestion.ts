import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatbotSpend =
	| { allowanceRemaining: number }
	| 'chatbot_out_of_credits'
	| 'allowance_exhausted'
	| 'chatbot_paused'
	| 'not_a_member';

const refusals: Exclude<ChatbotSpend, object>[] = [
	'chatbot_out_of_credits',
	'allowance_exhausted',
	'chatbot_paused',
	'not_a_member'
];

// Service-role only: the server names the member and the price, so a
// browser can neither spend as someone else nor refund at will. The reserve
// is the effective model's floor; settleChatbotQuestion takes whatever the
// marked-up bill owes beyond it once the answer exists.
export async function spendForChatbotQuestion(
	service: SupabaseClient,
	chatbotId: string,
	memberId: string,
	reserveCredits: number
): Promise<ChatbotSpend> {
	const { data, error } = await service.rpc('spend_for_chatbot_question', {
		target_chatbot: chatbotId,
		member: memberId,
		credit_amount: reserveCredits
	});
	if (error === null) return { allowanceRemaining: data };
	const refusal = refusals.find((candidate) => error.message.includes(candidate));
	if (refusal !== undefined) return refusal;
	throw error;
}
