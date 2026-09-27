import { refundCredits } from './spendCredits';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

export type PayerReserve =
	| { creditBalance: number }
	| 'insufficient_credits'
	| 'account_restricted';

/**
 * The reserve for work nobody is signed in to ask for — data an MCP server or
 * an API client sends — taken from the owner's ledger by the server.
 * settle_credits_for never refuses, so a reserve the balance could not cover
 * is handed straight back and reported as insufficient.
 */
export async function reserveCreditsForPayer(
	payerId: string,
	amount: number,
	reason: string
): Promise<PayerReserve> {
	if (await isRestricted(payerId)) return 'account_restricted';
	const { data, error } = await supabaseServiceClient().rpc('settle_credits_for', {
		payer: payerId,
		credit_amount: amount,
		settle_reason: reason
	});
	if (error !== null) throw error;
	if (data >= 0) return { creditBalance: data };
	await refundCredits(payerId, amount, reason);
	return 'insufficient_credits';
}

async function isRestricted(payerId: string): Promise<boolean> {
	const { data, error } = await supabaseServiceClient()
		.from('profiles')
		.select('is_restricted')
		.eq('id', payerId)
		.maybeSingle();
	if (error !== null) throw error;
	return data?.is_restricted === true;
}
