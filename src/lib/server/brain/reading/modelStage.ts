import { loadSourceContent, reconcileByteCount } from './loadSourceContent';
import { getBrainContexts } from '../getBrainContexts';
import { getBrainPageIndex } from '../getBrainPageIndex';
import { ingestSource } from '../ingestSource';
import { recordBrainEvent } from '../recordBrainEvent';
import { retireSupersededPages } from '../retireSupersededPages';
import { saveBrainContextWrites } from '../saveBrainContextWrites';
import { saveBrainPageWrites } from '../saveBrainPageWrites';
import { sweepEmptyBrainContexts } from '../sweepEmptyBrainContexts';
import { proposeModelChanges } from '$lib/server/sharing/proposeModelChanges';
import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
import type { ReadingProgress } from '$lib/data/sourceReading';
import type { StoredBrainSource } from '../findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ModelStageOutcome =
	| { outcome: 'modelled'; progress: Partial<ReadingProgress>; summary: string }
	| { outcome: 'proposed' };

/**
 * The first stage: the modeller reads the source against the current index
 * and the model is updated — or, when a collaborator sent it, the changes
 * are filed for the owner to review and the reading ends there.
 */
export async function runModelStage(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	brain: DomainBrain,
	proposer: { email: string } | null
): Promise<ModelStageOutcome> {
	const content = await loadSourceContent(supabase, source);
	await reconcileByteCount(supabase, source, content.byteCount);
	const contexts = await getBrainContexts(supabase, source.brainId);
	const index = await getBrainPageIndex(supabase, source.brainId);
	const record = await ingestSource(content.contentBlock, source.filename, brain, contexts, index);
	if (proposer !== null) {
		await proposeModelChanges(supabase, source, record, proposer.email);
		return { outcome: 'proposed' };
	}
	const contextWrites = await saveBrainContextWrites(supabase, source.brainId, record.contextWrites);
	const pageWrites = await saveBrainPageWrites(supabase, source.brainId, record.pageWrites);
	await retireSupersededPages(supabase, source, record.pageRetires, index);
	await sweepEmptyBrainContexts(supabase, source.brainId, source.id);
	for (const write of contextWrites) {
		await recordBrainEvent(supabase, {
			brainId: source.brainId,
			kind: write.wasCreated ? 'context_created' : 'context_updated',
			detail: { contextSlug: write.slug },
			sourceId: source.id
		});
	}
	for (const write of pageWrites) {
		await recordBrainEvent(supabase, {
			brainId: source.brainId,
			kind: write.wasCreated ? 'page_created' : 'page_updated',
			detail: {},
			sourceId: source.id,
			pageSlug: write.slug
		});
	}
	return {
		outcome: 'modelled',
		summary: record.sourceSummary,
		progress: {
			contextsCreated: contextWrites.filter((write) => write.wasCreated).length,
			pagesCreated: pageWrites.filter((write) => write.wasCreated).length,
			pagesUpdated: pageWrites.filter((write) => !write.wasCreated).length,
			logLine: record.logLine
		}
	};
}
