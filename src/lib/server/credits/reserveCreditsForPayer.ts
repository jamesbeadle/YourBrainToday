import { refundCredits } from './spendCredits';
import { settleCreditsFor } from './settleCreditsFor';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

export type PayerReserve =
	| { creditBalance: number }
	| 'insufficient_credits'
	| 'account_restricted';

/**
 * The reserve for work nobody is signed in to ask for — data an MCP server or
 * an API client sends — taken from the owner's ledger by the server. A
 * reserve the balance could only partly cover is handed straight back and
 * reported as insufficient.
 */
export async function reserveCreditsForPayer(
	payerId: string,
	amount: number,
	reason: string
): Promise<PayerReserve> {
	if (await isRestricted(payerId)) return 'account_restricted';
	const settlement = await settleCreditsFor(payerId, amount, reason);
	if (settlement.creditsTaken === amount) return { creditBalance: settlement.creditBalance };
	if (settlement.creditsTaken > 0) await refundCredits(payerId, settlement.creditsTaken, reason);
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
