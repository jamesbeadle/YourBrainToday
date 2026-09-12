import type { SupabaseClient } from '@supabase/supabase-js';

export const spendWindowMilliseconds = 60 * 1000;

export function spendWindowStart(): string {
	return new Date(Date.now() - spendWindowMilliseconds).toISOString();
}

// Every debit the user's ledger took in the last minute: reserves,
// settlements and surcharges alike. Reads through whichever client the
// caller holds — a user's own session sees only their own ledger.
export async function countRecentSpends(
	supabase: SupabaseClient,
	userId: string,
	reason?: string
): Promise<number> {
	let query = supabase
		.from('credit_ledger')
		.select('id', { count: 'exact', head: true })
		.eq('user_id', userId)
		.lt('delta', 0)
		.gte('created_at', spendWindowStart());
	if (reason !== undefined) query = query.eq('reason', reason);
	const { count, error } = await query;
	if (error !== null) throw error;
	return count ?? 0;
}
