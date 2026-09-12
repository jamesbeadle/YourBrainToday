import type { SupabaseClient } from '@supabase/supabase-js';

export type Purchase = {
	id: string;
	packId: string;
	credits: number;
	amountPence: number;
	status: string;
	purchasedAt: string;
};

export async function getPurchaseHistory(supabase: SupabaseClient): Promise<Purchase[]> {
	const { data, error } = await supabase
		.from('purchases')
		.select()
		.order('created_at', { ascending: false });
	if (error) throw error;
	return data.map((row) => ({
		id: row.id,
		packId: row.pack_id,
		credits: row.credits,
		amountPence: row.amount_pence,
		status: row.status,
		purchasedAt: row.created_at
	}));
}
