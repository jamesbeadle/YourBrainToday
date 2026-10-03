import { harvestCreditsFor, ingestCreditsFor } from '$lib/data/creditPricing';
import { countRecentSpends } from '$lib/server/credits/recentSpendCount';
import { mostSpendsPerMinute } from '$lib/server/credits/requireSpendHeadroom';
import { refundQuestionUsage } from '$lib/server/credits/refundQuestionUsage';
import { reserveCreditsForPayer, type PayerReserve } from '$lib/server/credits/reserveCreditsForPayer';
import { settleQuestionUsage } from '$lib/server/credits/settleQuestionUsage';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { MeteredCall } from '$lib/data/anthropicUsage';
import type { ReadingProgress } from '$lib/data/sourceReading';

export type ReadingReason = 'brain_ingest_sized' | 'brain_ingest_sent' | 'chatbot_teach';

const harvestReason = 'knowledge_harvest';

export type ReadingPayer = { payerId: string; reason: ReadingReason };

/**
 * Every reading is paid for by the brain's owner, whoever started it: the
 * sized reserve is taken before the first stage, each harvest is charged as
 * its items are filed, and the marked-up bill is settled or the reserve
 * refunded when the last stage ends. The server names the payer, so one
 * path serves an upload, data sent over MCP and the API alike.
 */
export async function reserveReadingCredits(
	payer: ReadingPayer,
	byteCount: number
): Promise<{ reserve: number; outcome: PayerReserve | 'rate_limited' }> {
	const reserve = ingestCreditsFor(byteCount);
	const recentSpends = await countRecentSpends(supabaseServiceClient(), payer.payerId);
	if (recentSpends >= mostSpendsPerMinute) return { reserve, outcome: 'rate_limited' };
	return { reserve, outcome: await reserveCreditsForPayer(payer.payerId, reserve, payer.reason) };
}

export async function chargeHarvest(payerId: string, itemCount: number): Promise<void> {
	if (itemCount <= 0) return;
	const { error } = await supabaseServiceClient().rpc('settle_credits_for', {
		payer: payerId,
		credit_amount: harvestCreditsFor(itemCount),
		settle_reason: harvestReason
	});
	if (error !== null) console.error('Harvest charge failed', { payerId, itemCount }, error);
}

export async function settleReading(
	payer: ReadingPayer,
	reservedCredits: number,
	progress: ReadingProgress
): Promise<number | null> {
	return settleQuestionUsage(payer.payerId, reservedCredits, payer.reason, progress.meteredCalls);
}

export async function refundReading(
	payer: ReadingPayer,
	reservedCredits: number,
	calls: MeteredCall[]
): Promise<void> {
	await refundQuestionUsage(payer.payerId, reservedCredits, payer.reason, calls);
}
