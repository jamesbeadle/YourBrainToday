import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

/** A payer's balance read by the server, for work done on their behalf with nobody signed in. */
export async function getCreditBalanceFor(payerId: string): Promise<number> {
	const { data, error } = await supabaseServiceClient()
		.from('credit_ledger')
		.select('delta')
		.eq('user_id', payerId);
	if (error !== null) throw error;
	return (data ?? []).reduce((total, row) => total + Number(row.delta ?? 0), 0);
}
