import { readSourceToCompletion } from '../reading/readSourceToCompletion';
import { findBrainSource } from '../findBrainSource';
import { storeSentData } from './storeSentData';
import { sentDataProblem } from './sentDataRules';
import { slowDownMessage } from '$lib/server/credits/requireSpendHeadroom';
import { getCreditBalanceFor } from '$lib/server/credits/getCreditBalanceFor';
import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
import type { SentData, SentDataOrigin, SentDataOutcome } from './sentDataTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Data sent in from outside the site — by an MCP server or an API client —
 * trains the brain exactly as an uploaded document does, and appears among
 * its ingested data. The brain's owner pays, as for any upload, and every
 * stage runs here in turn because nobody is there to ask for the next one.
 */
export async function ingestSentData(
	serviceSupabase: SupabaseClient,
	brain: DomainBrain,
	sent: SentData,
	origin: SentDataOrigin
): Promise<SentDataOutcome> {
	const problem = sentDataProblem(sent);
	if (problem !== null) return { status: 'rejected', message: problem };
	const source = await storeSentData(serviceSupabase, brain, sent, origin);
	const reading = await readSourceToCompletion(serviceSupabase, source, {
		brain,
		payer: { payerId: brain.ownerId, reason: 'brain_ingest_sent' },
		proposer: null
	});
	if (reading.status === 'rate_limited') return { status: 'rejected', message: slowDownMessage };
	if (reading.status === 'out_of_credits') return { status: 'out_of_credits' };
	if (reading.status === 'account_restricted') return { status: 'account_restricted' };
	if (reading.status === 'failed') {
		return { status: 'failed', message: `Reading that data failed — ${reading.failure}. The credits were refunded.` };
	}
	if (reading.status !== 'ingested') {
		return { status: 'failed', message: 'That data is already being read.' };
	}
	const ingested = await findBrainSource(serviceSupabase, source.id);
	return {
		status: 'ingested',
		sourceId: source.id,
		summary: ingested?.summary ?? '',
		creditBalance: reading.creditBalance ?? (await getCreditBalanceFor(brain.ownerId))
	};
}
