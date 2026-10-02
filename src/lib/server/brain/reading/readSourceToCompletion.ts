import { claimSourceReading, type ReadingClaim } from './claimSourceReading';
import { runReadingStage, type ReadingContext, type ReadingStep } from './runReadingStage';
import { findBrainSource, type StoredBrainSource } from '../findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export type CompletedReading =
	| Exclude<ReadingClaim, { status: 'claimed' }>
	| Exclude<ReadingStep, { status: 'reading' }>;

/**
 * Every stage in turn, inside one caller — the way an MCP server or an API
 * client reads a source, where nobody is there to ask for the next stage.
 * The browser drives the same stages one request at a time instead.
 */
export async function readSourceToCompletion(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	context: ReadingContext
): Promise<CompletedReading> {
	const claim = await claimSourceReading(supabase, source, context.payer);
	if (claim.status !== 'claimed') return claim;
	let current: StoredBrainSource | null = claim.source;
	while (current !== null) {
		const step = await runReadingStage(supabase, current, context);
		if (step.status !== 'reading') return step;
		current = await findBrainSource(supabase, source.id);
	}
	return { status: 'busy' };
}
