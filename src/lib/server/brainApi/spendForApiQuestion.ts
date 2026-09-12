import type { BrainSpend } from '$lib/server/brain/spendForBrainWork';
import { creditsPerBrainQuestion } from '$lib/data/creditPricing';
import { refundQuestionUsage } from '$lib/server/credits/refundQuestionUsage';
import { settleQuestionUsage } from '$lib/server/credits/settleQuestionUsage';
import type { SupabaseClient } from '@supabase/supabase-js';

export const apiQuestionReason = 'brain_api_question';

export async function spendForApiQuestion(
	supabase: SupabaseClient,
	tokenHash: string
): Promise<BrainSpend> {
	const { data, error } = await supabase.rpc('spend_for_brain_api_question', {
		p_token_hash: tokenHash
	});
	if (error === null) return { creditBalance: data };
	if (error.message.includes('insufficient_credits')) return 'insufficient_credits';
	if (error.message.includes('account_restricted')) return 'account_restricted';
	throw error;
}

// spend_for_brain_api_question takes the fixed 10 (the cheapest rung's
// floor); the owner settles the marked-up bill beyond it like any session.
export async function settleForApiQuestion(brainOwnerId: string): Promise<number | null> {
	return settleQuestionUsage(brainOwnerId, creditsPerBrainQuestion, apiQuestionReason);
}

export async function refundForApiQuestion(brainOwnerId: string): Promise<void> {
	await refundQuestionUsage(brainOwnerId, creditsPerBrainQuestion, apiQuestionReason);
}
