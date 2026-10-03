import { reserveReadingCredits, type ReadingPayer } from './readingPayments';
import { asStoredSource, storedSourceColumns, type StoredBrainSource } from '../findBrainSource';
import { emptyReadingProgress, firstReadingStage } from '$lib/data/sourceReading';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ReadingClaim =
	| { status: 'claimed'; source: StoredBrainSource; creditBalance: number }
	| { status: 'already_reading' }
	| { status: 'out_of_credits' }
	| { status: 'account_restricted' }
	| { status: 'rate_limited' };

const claimableStatuses = ['uploaded', 'failed', 'ingested'];

/**
 * Begins a reading: reserves the owner's credits, then takes the row from
 * waiting, failed or already-read to reading — at the first stage, or at the
 * stage a failed reading stopped on, keeping what the stages before it
 * filed. The update is conditional on the status it found, so two requests
 * racing for the same source agree on which one is reading it.
 */
export async function claimSourceReading(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	payer: ReadingPayer
): Promise<ReadingClaim> {
	if (!claimableStatuses.includes(source.status)) return { status: 'already_reading' };
	const { reserve, outcome } = await reserveReadingCredits(payer, source.byteCount);
	if (outcome === 'rate_limited') return { status: 'rate_limited' };
	if (outcome === 'insufficient_credits') return { status: 'out_of_credits' };
	if (outcome === 'account_restricted') return { status: 'account_restricted' };
	const resumesAt = source.status === 'failed' && source.stage !== null ? source.stage : null;
	const { data, error } = await supabase
		.from('brain_sources')
		.update({
			status: 'reading',
			stage: resumesAt ?? firstReadingStage,
			stage_started_at: null,
			failure: '',
			reserved_credits: reserve,
			progress: resumesAt === null ? emptyReadingProgress : source.progress
		})
		.eq('id', source.id)
		.eq('status', source.status)
		.select(storedSourceColumns);
	if (error !== null) throw error;
	const claimed = (data as unknown as Record<string, unknown>[] | null)?.[0];
	if (claimed === undefined) return { status: 'already_reading' };
	return { status: 'claimed', source: asStoredSource(claimed), creditBalance: outcome.creditBalance };
}
