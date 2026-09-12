import type { SupabaseClient } from '@supabase/supabase-js';

export type HiveSpend = { creditBalance: number } | 'insufficient_credits' | 'account_restricted';

export const hiveMindQuestionReason = 'hive_mind_question';

export async function spendForHiveMindQuestion(supabase: SupabaseClient): Promise<HiveSpend> {
	const { data, error } = await supabase.rpc('spend_for_hive_mind_question', {});
	if (error === null) return { creditBalance: data };
	if (error.message.includes('insufficient_credits')) return 'insufficient_credits';
	if (error.message.includes('account_restricted')) return 'account_restricted';
	throw error;
}
