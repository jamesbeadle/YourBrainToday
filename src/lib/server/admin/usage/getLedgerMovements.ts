import type { SupabaseClient } from '@supabase/supabase-js';

export type LedgerMovement = {
	userId: string;
	delta: number;
	reason: string;
	createdAt: Date;
};

// The whole ledger, not just the window: a balance is the sum of every
// movement a user has ever had, and the ledger is small enough to read.
export async function getLedgerMovements(service: SupabaseClient): Promise<LedgerMovement[]> {
	const { data, error } = await service
		.from('credit_ledger')
		.select('user_id, delta, reason, created_at');
	if (error !== null) throw error;
	return data.map((row) => ({
		userId: row.user_id,
		delta: row.delta,
		reason: row.reason,
		createdAt: new Date(row.created_at)
	}));
}
