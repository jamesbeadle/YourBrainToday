import { questionCreditsFor } from '$lib/data/creditPricing';
import { meteredCallsSoFar } from '$lib/server/anthropic/modelContext';
import { recordModelUsage } from './recordModelUsage';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

// Reserve-then-settle: the reserve was taken before the work; once the
// answer is in, anything the marked-up bill owes beyond it is taken now
// through the service-role settle_credits_for, which has no balance check
// — a settlement that could bounce would make the reserve the real price.
// Every metered call is recorded either way: with the credits the job
// finally charged, or flagged with only the reserve when the settlement
// itself failed, so the margin view shows the leak.
// Returns the payer's new balance, or null when nothing more was owed.
export async function settleQuestionUsage(
	payerId: string,
	reservedCredits: number,
	reason: string
): Promise<number | null> {
	const calls = meteredCallsSoFar();
	const owed = Math.max(reservedCredits, questionCreditsFor(calls));
	const extra = owed - reservedCredits;
	if (extra <= 0) {
		await recordModelUsage({ payerId, reason, calls, creditsCharged: owed, hasFailedSettlement: false });
		return null;
	}
	const { data, error } = await supabaseServiceClient().rpc('settle_credits_for', {
		payer: payerId,
		credit_amount: extra,
		settle_reason: `${reason}_usage`
	});
	if (error !== null) {
		console.error('Usage settlement failed', reason, error);
		await recordModelUsage({
			payerId,
			reason,
			calls,
			creditsCharged: reservedCredits,
			hasFailedSettlement: true
		});
		return null;
	}
	await recordModelUsage({ payerId, reason, calls, creditsCharged: owed, hasFailedSettlement: false });
	return data;
}
