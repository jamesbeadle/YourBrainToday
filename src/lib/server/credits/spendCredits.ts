import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

export type CreditSpend = { creditBalance: number } | 'insufficient_credits' | 'account_restricted';

const nothingToRefund = 'nothing_to_refund';

export async function spendCredits(
	supabase: SupabaseClient,
	amount: number,
	reason: string
): Promise<CreditSpend> {
	const { data, error } = await supabase.rpc('spend_credits_for', {
		amount,
		spend_reason: reason
	});
	if (error === null) return { creditBalance: data };
	if (error.message.includes('insufficient_credits')) return 'insufficient_credits';
	if (error.message.includes('account_restricted')) return 'account_restricted';
	throw error;
}

// Refunds run only on the server, which names the payer: the database
// refuses this call from a browser session (migration 0046). A refund that
// fails is reported rather than thrown, so it never hides the failure that
// prompted it from the user.
export async function refundCredits(payerId: string, amount: number, reason: string): Promise<void> {
	const { error } = await supabaseServiceClient().rpc('refund_credits_for_user', {
		payer: payerId,
		amount,
		refund_reason: reason
	});
	if (error === null || error.message.includes(nothingToRefund)) return;
	console.error('Credit refund failed', { payerId, amount, reason }, error);
}
