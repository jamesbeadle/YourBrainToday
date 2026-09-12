import { auditModelForPrune } from './auditModelForPrune';
import { deleteBrainPages } from './deleteBrainPages';
import { getBrainContexts } from './getBrainContexts';
import { getBrainPageIndex } from './getBrainPageIndex';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import { recordBrainEvent } from './recordBrainEvent';
import { recordPruneEvents } from './recordPruneEvents';
import { saveBrainContextWrites } from './saveBrainContextWrites';
import { saveBrainPageWrites } from './saveBrainPageWrites';
import { sweepEmptyBrainContexts } from './sweepEmptyBrainContexts';
import type { BrainPageSummary } from '$lib/data/brainTypes';
import type { PruneRecord } from './parsePruneRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

export type PruneOutcome = {
	logLine: string;
	pagesWritten: number;
	pagesRetired: number;
	contextsDeleted: number;
};

export async function runModelPrune(
	supabase: SupabaseClient,
	brainId: string
): Promise<PruneOutcome> {
	const brain = await getDomainBrain(supabase, brainId);
	if (brain === null) throw new Error('That expertise brain no longer exists');
	const sweptBefore = await sweepEmptyBrainContexts(supabase, brainId);
	const contexts = await getBrainContexts(supabase, brainId);
	const index = await getBrainPageIndex(supabase, brainId);
	if (index.length === 0) {
		return emptyModelOutcome(supabase, brainId, sweptBefore.length);
	}
	const record = await auditModelForPrune(supabase, brain, contexts, index);
	const appliedContextWrites = await saveBrainContextWrites(supabase, brainId, record.contextWrites);
	const appliedPageWrites = await saveBrainPageWrites(supabase, brainId, record.pageWrites);
	const deletedSlugs = await deleteBrainPages(
		supabase,
		brainId,
		retirableSlugs(record, index)
	);
	const sweptAfter = await sweepEmptyBrainContexts(supabase, brainId);
	await recordPruneEvents(supabase, brainId, appliedContextWrites, appliedPageWrites, deletedSlugs);
	const outcome = {
		logLine: record.logLine === '' ? record.findings : record.logLine,
		pagesWritten: appliedPageWrites.length,
		pagesRetired: deletedSlugs.length,
		contextsDeleted: sweptBefore.length + sweptAfter.length
	};
	await recordBrainEvent(supabase, {
		brainId,
		kind: 'model_pruned',
		detail: { ...outcome, findings: record.findings }
	});
	return outcome;
}

async function emptyModelOutcome(
	supabase: SupabaseClient,
	brainId: string,
	contextsDeleted: number
): Promise<PruneOutcome> {
	const outcome = {
		logLine:
			contextsDeleted > 0
				? 'Removed empty bounded contexts — the model holds no pages yet.'
				: 'The model is empty — nothing to prune.',
		pagesWritten: 0,
		pagesRetired: 0,
		contextsDeleted
	};
	if (contextsDeleted > 0) {
		await recordBrainEvent(supabase, { brainId, kind: 'model_pruned', detail: { ...outcome } });
	}
	return outcome;
}

function retirableSlugs(record: PruneRecord, index: BrainPageSummary[]): string[] {
	return record.pageRetires.filter((slug) =>
		index.some((page) => page.slug === slug && page.kind !== 'context_map')
	);
}
