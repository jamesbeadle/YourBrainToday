import type { SupabaseClient } from '@supabase/supabase-js';
import {
	creditsPerBrainPrune,
	creditsPerBrainQuestion,
	creditsPerBrainUnlearn
} from '$lib/data/creditPricing';
import { refundQuestionUsage } from '$lib/server/credits/refundQuestionUsage';

export type BrainSpend = { creditBalance: number } | 'insufficient_credits' | 'account_restricted';

const brainQuestionReason = 'brain_question';
export const brainPruneReason = 'brain_prune';
export const brainUnlearnReason = 'brain_unlearn';

export async function spendForBrainQuestion(supabase: SupabaseClient): Promise<BrainSpend> {
	return spendThrough(supabase, 'spend_for_brain_question', {});
}

export async function spendForBrainPrune(supabase: SupabaseClient): Promise<BrainSpend> {
	return spendThrough(supabase, 'spend_for_brain_prune', {});
}

export async function refundForBrainPrune(payerId: string): Promise<void> {
	await refundQuestionUsage(payerId, creditsPerBrainPrune, brainPruneReason);
}

export async function spendForBrainUnlearn(
	supabase: SupabaseClient,
	sourceId: string
): Promise<BrainSpend> {
	return spendThrough(supabase, 'spend_for_brain_unlearn', { source_identifier: sourceId });
}

export async function refundForBrainUnlearn(payerId: string): Promise<void> {
	await refundQuestionUsage(payerId, creditsPerBrainUnlearn, brainUnlearnReason);
}

export async function refundForBrainQuestion(payerId: string): Promise<void> {
	await refundQuestionUsage(payerId, creditsPerBrainQuestion, brainQuestionReason);
}

async function spendThrough(
	supabase: SupabaseClient,
	functionName: string,
	functionArguments: Record<string, string>
): Promise<BrainSpend> {
	const { data, error } = await supabase.rpc(functionName, functionArguments);
	if (error === null) return { creditBalance: data };
	if (error.message.includes('insufficient_credits')) return 'insufficient_credits';
	if (error.message.includes('account_restricted')) return 'account_restricted';
	throw error;
}
