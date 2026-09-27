import { findBrainSource, markSourceStatus } from '../findBrainSource';
import { runSourceIngest } from '../runSourceIngest';
import { sentDataByteCount, storeSentData } from './storeSentData';
import { sentDataProblem } from './sentDataRules';
import { countRecentSpends } from '$lib/server/credits/recentSpendCount';
import { mostSpendsPerMinute, slowDownMessage } from '$lib/server/credits/requireSpendHeadroom';
import { ingestCreditsFor } from '$lib/data/creditPricing';
import { refundQuestionUsage } from '$lib/server/credits/refundQuestionUsage';
import { reserveCreditsForPayer } from '$lib/server/credits/reserveCreditsForPayer';
import { settleQuestionUsage } from '$lib/server/credits/settleQuestionUsage';
import type { SentData, SentDataOrigin, SentDataOutcome } from './sentDataTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const sentIngestReason = 'brain_ingest_sent';
const failureSummaryLimit = 160;

type ReceivingBrain = { id: string; ownerId: string };

/**
 * Data sent in from outside the site — by an MCP server or an API client —
 * trains the brain exactly as an uploaded document does, and appears among
 * its ingested data. The brain's owner pays, as for any upload.
 */
export async function ingestSentData(
	serviceSupabase: SupabaseClient,
	brain: ReceivingBrain,
	sent: SentData,
	origin: SentDataOrigin
): Promise<SentDataOutcome> {
	const problem = sentDataProblem(sent);
	if (problem !== null) return { status: 'rejected', message: problem };
	const recentSpends = await countRecentSpends(serviceSupabase, brain.ownerId);
	if (recentSpends >= mostSpendsPerMinute) return { status: 'rejected', message: slowDownMessage };
	const reserve = ingestCreditsFor(sentDataByteCount(sent));
	const reservation = await reserveCreditsForPayer(brain.ownerId, reserve, sentIngestReason);
	if (reservation === 'insufficient_credits') return { status: 'out_of_credits' };
	if (reservation === 'account_restricted') return { status: 'account_restricted' };
	const source = await storeSentData(serviceSupabase, brain, sent, origin);
	try {
		await runSourceIngest(serviceSupabase, source);
	} catch (failure) {
		console.error('Ingesting sent data failed', failure);
		await markSourceStatus(serviceSupabase, source.id, 'failed', failureSummary(failure));
		await refundQuestionUsage(brain.ownerId, reserve, sentIngestReason);
		return { status: 'failed', message: 'Reading that data failed — the credits were refunded' };
	}
	const settledBalance = await settleQuestionUsage(brain.ownerId, reserve, sentIngestReason);
	const ingested = await findBrainSource(serviceSupabase, source.id);
	return {
		status: 'ingested',
		sourceId: source.id,
		summary: ingested?.summary ?? '',
		creditBalance: settledBalance ?? reservation.creditBalance
	};
}

function failureSummary(failure: unknown): string {
	const message = failure instanceof Error ? failure.message : 'Unknown failure';
	return message.slice(0, failureSummaryLimit);
}
