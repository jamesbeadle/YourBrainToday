import { refundReading, settleReading, type ReadingPayer } from './readingPayments';
import { recordBrainEvent } from '../recordBrainEvent';
import { meteredCallsSoFar } from '$lib/server/anthropic/modelContext';
import type { ReadingProgress } from '$lib/data/sourceReading';
import type { StoredBrainSource } from '../findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

const failureLimit = 300;

/** The last stage is done: the reading is on the log, the row is in the brain, the bill is settled. */
export async function completeReading(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	progress: ReadingProgress,
	payer: ReadingPayer
): Promise<number | null> {
	await recordBrainEvent(supabase, {
		brainId: source.brainId,
		kind: 'source_ingested',
		detail: {
			filename: source.filename,
			logLine: progress.logLine,
			experienceEpisodes: progress.episodes,
			processTasks: progress.processTasks,
			humanConnections: progress.connections
		},
		sourceId: source.id
	});
	const { error } = await supabase
		.from('brain_sources')
		.update({ status: 'ingested', stage: '', stage_started_at: null, failure: '', progress })
		.eq('id', source.id);
	if (error !== null) throw error;
	return settleReading(payer, source.reservedCredits, progress);
}

/** A stage failed: the row says which and why, keeps its stage so it can resume, and the reserve goes back. */
export async function failReading(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	failure: unknown,
	payer: ReadingPayer
): Promise<string> {
	const reason = describeFailure(failure);
	console.error('Reading a source failed', source.id, source.stage, failure);
	const { error } = await supabase
		.from('brain_sources')
		.update({ status: 'failed', stage_started_at: null, failure: reason })
		.eq('id', source.id);
	if (error !== null) console.error('Marking the source failed also failed', error);
	await refundReading(payer, source.reservedCredits, [...source.progress.meteredCalls, ...meteredCallsSoFar()]);
	return reason;
}

function describeFailure(failure: unknown): string {
	const message = failure instanceof Error ? failure.message : 'Unknown failure';
	return message.slice(0, failureLimit);
}
