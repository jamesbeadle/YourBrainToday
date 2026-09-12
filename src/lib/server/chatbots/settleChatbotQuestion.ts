import type { SupabaseClient } from '@supabase/supabase-js';
import { questionCreditsFor } from '$lib/data/creditPricing';
import { meteredCallsSoFar } from '$lib/server/anthropic/modelContext';
import { recordModelUsage } from '$lib/server/credits/recordModelUsage';

export type ChatbotPayer = { id: string; ownerId: string };

const chatbotQuestionReason = 'chatbot_question';

// Both RPCs are service-role only. The owner funded the pool, so every
// metered call is recorded against them with the credits the pool gave up.
export async function refundForChatbotQuestion(
	service: SupabaseClient,
	chatbot: ChatbotPayer,
	memberId: string,
	reserveCredits: number
): Promise<void> {
	const { error } = await service.rpc('refund_for_chatbot_question', {
		target_chatbot: chatbot.id,
		member: memberId,
		credit_amount: reserveCredits
	});
	if (error !== null) console.error('Chatbot refund failed', error);
	await recordChatbotUsage(chatbot, 0, false);
}

// Returns what the pool was actually charged beyond the reserve, which is
// nothing when the settlement RPC fails — that shortfall is recorded as a
// failed settlement so the margin view shows it.
export async function settleChatbotQuestion(
	service: SupabaseClient,
	chatbot: ChatbotPayer,
	memberId: string,
	reserveCredits: number
): Promise<number> {
	const owed = Math.max(reserveCredits, questionCreditsFor(meteredCallsSoFar()));
	const extra = owed - reserveCredits;
	if (extra <= 0) {
		await recordChatbotUsage(chatbot, owed, false);
		return 0;
	}
	const { data, error } = await service.rpc('settle_chatbot_question', {
		target_chatbot: chatbot.id,
		member: memberId,
		credit_amount: extra
	});
	if (error !== null) {
		console.error('Chatbot settlement failed', error);
		await recordChatbotUsage(chatbot, reserveCredits, true);
		return 0;
	}
	const settled: number = data ?? 0;
	await recordChatbotUsage(chatbot, reserveCredits + settled, settled < extra);
	return settled;
}

async function recordChatbotUsage(
	chatbot: ChatbotPayer,
	creditsCharged: number,
	hasFailedSettlement: boolean
): Promise<void> {
	await recordModelUsage({
		payerId: chatbot.ownerId,
		reason: chatbotQuestionReason,
		chatbotId: chatbot.id,
		calls: meteredCallsSoFar(),
		creditsCharged,
		hasFailedSettlement
	});
}
