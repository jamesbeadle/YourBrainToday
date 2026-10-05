import { questionCreditsFor } from '$lib/data/creditPricing';
import { meteredCallsSoFar } from '$lib/server/anthropic/modelContext';
import { recordModelUsage } from './recordModelUsage';
import { settleCreditsFor } from './settleCreditsFor';
import type { MeteredCall } from '$lib/data/anthropicUsage';

// Reserve-then-settle: the reserve was taken before the work; once the
// answer is in, anything the marked-up bill owes beyond it is settled now.
// The balance never goes below zero, so a settlement takes what the balance
// can cover and the job is recorded with the credits it actually charged —
// the margin view shows the shortfall against the cost. A settlement that
// itself failed is recorded with only the reserve and flagged.
// Returns the payer's new balance, or null when nothing more was owed.
export async function settleQuestionUsage(
	payerId: string,
	reservedCredits: number,
	reason: string,
	calls: MeteredCall[] = meteredCallsSoFar()
): Promise<number | null> {
	const owed = Math.max(reservedCredits, questionCreditsFor(calls));
	const extra = owed - reservedCredits;
	if (extra <= 0) {
		await recordModelUsage({ payerId, reason, calls, creditsCharged: owed, hasFailedSettlement: false });
		return null;
	}
	try {
		const settlement = await settleCreditsFor(payerId, extra, `${reason}_usage`);
		const creditsCharged = reservedCredits + settlement.creditsTaken;
		await recordModelUsage({ payerId, reason, calls, creditsCharged, hasFailedSettlement: false });
		return settlement.creditBalance;
	} catch (failure) {
		console.error('Usage settlement failed', reason, failure);
		await recordModelUsage({
			payerId,
			reason,
			calls,
			creditsCharged: reservedCredits,
			hasFailedSettlement: true
		});
		return null;
	}
}
