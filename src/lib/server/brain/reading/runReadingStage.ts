import { advanceReadingStage, claimReadingStage } from './claimReadingStage';
import { completeReading, failReading } from './finishReading';
import { runHarvestStage } from './harvestStage';
import { runModelStage } from './modelStage';
import { settleReading, type ReadingPayer } from './readingPayments';
import { meteredCallsSoFar } from '$lib/server/anthropic/modelContext';
import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
import type { ReadingProgress, ReadingStage } from '$lib/data/sourceReading';
import type { StoredBrainSource } from '../findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ReadingStep =
	| { status: 'reading'; stage: ReadingStage }
	| { status: 'ingested'; creditBalance: number | null }
	| { status: 'proposed' }
	| { status: 'failed'; failure: string }
	| { status: 'busy' };

export type ReadingContext = {
	brain: DomainBrain;
	payer: ReadingPayer;
	proposer: { email: string } | null;
};

/**
 * Runs the stage a reading is on and moves it to the next, or finishes it.
 * Each call is one request's worth of work; the row carries the reading
 * between calls, so a browser, an MCP server and an API client all drive the
 * same machine, and a stage that dies with its function is picked up where
 * the row says it stopped.
 */
export async function runReadingStage(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	context: ReadingContext
): Promise<ReadingStep> {
	if (source.stage === null) return { status: 'busy' };
	const claimed = await claimReadingStage(supabase, source, source.stage);
	if (claimed === null) return { status: 'busy' };
	try {
		return await runClaimedStage(supabase, claimed, source.stage, context);
	} catch (failure) {
		return { status: 'failed', failure: await failReading(supabase, claimed, failure, context.payer) };
	}
}

async function runClaimedStage(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	stage: ReadingStage,
	context: ReadingContext
): Promise<ReadingStep> {
	const delta = await runStageWork(supabase, source, stage, context);
	if (delta === null) {
		await settleReading(context.payer, source.reservedCredits, progressAfter(source, {}));
		return { status: 'proposed' };
	}
	const progress = progressAfter(source, delta);
	const nextStage = await advanceReadingStage(supabase, source, stage, progress);
	if (nextStage !== null) return { status: 'reading', stage: nextStage };
	const creditBalance = await completeReading(supabase, source, progress, context.payer);
	return { status: 'ingested', creditBalance };
}

/** The stage's own additions, or null when the model stage ended in a proposal. */
async function runStageWork(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	stage: ReadingStage,
	context: ReadingContext
): Promise<Partial<ReadingProgress> | null> {
	if (stage !== 'model') return runHarvestStage(supabase, source, stage, context.brain.ownerId);
	const modelled = await runModelStage(supabase, source, context.brain, context.proposer);
	if (modelled.outcome === 'proposed') return null;
	await rememberSummary(supabase, source, modelled.summary);
	return modelled.progress;
}

function progressAfter(source: StoredBrainSource, delta: Partial<ReadingProgress>): ReadingProgress {
	return {
		...source.progress,
		...delta,
		meteredCalls: [...source.progress.meteredCalls, ...meteredCallsSoFar()]
	};
}

async function rememberSummary(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	summary: string
): Promise<void> {
	if (summary === '') return;
	const { error } = await supabase.from('brain_sources').update({ summary }).eq('id', source.id);
	if (error !== null) throw error;
}
