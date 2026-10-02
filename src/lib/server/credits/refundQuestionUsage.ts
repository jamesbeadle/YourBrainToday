import { meteredCallsSoFar } from '$lib/server/anthropic/modelContext';
import { recordModelUsage } from './recordModelUsage';
import { refundCredits } from './spendCredits';
import type { MeteredCall } from '$lib/data/anthropicUsage';

// A job that failed after Claude had already answered part of it still cost
// Anthropic money. The reserve goes back to the payer as before; the calls
// are recorded at zero credits so the margin view counts what the failure
// cost the business.
export async function refundQuestionUsage(
	payerId: string,
	reservedCredits: number,
	reason: string,
	calls: MeteredCall[] = meteredCallsSoFar()
): Promise<void> {
	await refundCredits(payerId, reservedCredits, reason);
	await recordModelUsage({
		payerId,
		reason,
		calls,
		creditsCharged: 0,
		hasFailedSettlement: false
	});
}
