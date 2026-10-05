import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

export type CreditSettlement = { creditsTaken: number; creditBalance: number };

/**
 * The server-side debit for work already done, named for its payer. The
 * balance never goes below zero: the settlement takes what the balance can
 * cover and says how much that was, so the caller knows the shortfall.
 */
export async function settleCreditsFor(
	payerId: string,
	amount: number,
	reason: string
): Promise<CreditSettlement> {
	const { data, error } = await supabaseServiceClient().rpc('settle_credits_for', {
		payer: payerId,
		credit_amount: amount,
		settle_reason: reason
	});
	if (error !== null) throw error;
	return data as CreditSettlement;
}
