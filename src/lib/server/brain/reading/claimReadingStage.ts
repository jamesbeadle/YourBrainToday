import { asStoredSource, storedSourceColumns, type StoredBrainSource } from '../findBrainSource';
import { isStageStalled, stageAfter, type ReadingStage } from '$lib/data/sourceReading';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Takes one stage of a reading. The row is only moved on when it still names
 * the stage the caller saw and nobody began it recently, so a second tab or
 * a retried request never runs the same stage twice at once, while a stage
 * whose function died is free again once it has stalled.
 */
export async function claimReadingStage(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	stage: ReadingStage
): Promise<StoredBrainSource | null> {
	if (source.status !== 'reading' || source.stage !== stage) return null;
	if (!isStageStalled(source.stageStartedAt)) return null;
	let claim = supabase
		.from('brain_sources')
		.update({ stage_started_at: new Date().toISOString() })
		.eq('id', source.id)
		.eq('status', 'reading')
		.eq('stage', stage);
	claim =
		source.stageStartedAt === null
			? claim.is('stage_started_at', null)
			: claim.eq('stage_started_at', source.stageStartedAt);
	const { data, error } = await claim.select(storedSourceColumns);
	if (error !== null) throw error;
	const claimed = (data as unknown as Record<string, unknown>[] | null)?.[0];
	return claimed === undefined ? null : asStoredSource(claimed);
}

export async function advanceReadingStage(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	finishedStage: ReadingStage,
	progress: StoredBrainSource['progress']
): Promise<ReadingStage | null> {
	const nextStage = stageAfter(finishedStage);
	const { error } = await supabase
		.from('brain_sources')
		.update({ stage: nextStage ?? '', stage_started_at: null, progress })
		.eq('id', source.id);
	if (error !== null) throw error;
	return nextStage;
}
