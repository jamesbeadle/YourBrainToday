import type { SupabaseClient } from '@supabase/supabase-js';

export type TradeTalkEarnings = {
	totalCredits: number;
	awardCount: number;
};

export async function getTradeTalkEarnings(supabase: SupabaseClient): Promise<TradeTalkEarnings> {
	const { data, error } = await supabase
		.from('credit_ledger')
		.select('delta')
		.eq('reason', 'hive_mind_earning');
	if (error !== null) throw error;
	const rows = data ?? [];
	return {
		totalCredits: rows.reduce((total, row) => total + row.delta, 0),
		awardCount: rows.length
	};
}
