import { deleteBrainPages, deleteEmptyBrainContexts } from './deleteBrainPages';
import { deleteBrainSource } from './deleteBrainSource';
import { downloadSourceFile } from './downloadSourceFile';
import { getBrainContexts } from './getBrainContexts';
import { getBrainPageIndex } from './getBrainPageIndex';
import { getBrainPagesBySlugs } from './getBrainPage';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import { getSourceTouchedSlugs } from './getSourceContributions';
import { recordBrainEvent } from './recordBrainEvent';
import { saveBrainPageWrites } from './saveBrainPageWrites';
import { sourceContentBlock } from './sourceContentBlock';
import { unlearnSource } from './unlearnSource';
import { forgetSourceEpisodes } from '$lib/server/knowledge/forgetDocumentEpisodes';
import type { RetirementRecord } from './parseRetirementRecord';
import type { StoredBrainSource } from './findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function runSourceRemoval(
	supabase: SupabaseClient,
	source: StoredBrainSource
): Promise<void> {
	const touchedSlugs = await getSourceTouchedSlugs(supabase, source.id);
	const record = await retirementRecordFor(supabase, source, touchedSlugs);
	const rewrites = await saveBrainPageWrites(supabase, source.brainId, record.pageWrites);
	const safeDeletes = record.pageDeletes.filter((slug) => touchedSlugs.includes(slug));
	const deletedSlugs = await deleteBrainPages(supabase, source.brainId, safeDeletes);
	const deletedContexts = await deleteEmptyBrainContexts(
		supabase,
		source.brainId,
		record.contextDeletes
	);
	await recordRemovalEvents(supabase, source, rewrites, deletedSlugs, deletedContexts, record);
	await forgetSourceEpisodes(supabase, source.brainId, source.filename);
	await deleteBrainSource(supabase, source);
}

async function retirementRecordFor(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	touchedSlugs: string[]
): Promise<RetirementRecord> {
	const brain = await getDomainBrain(supabase, source.brainId);
	if (brain === null) throw new Error('That expertise brain no longer exists');
	const fileBytes = await downloadSourceFile(supabase, source.storagePath);
	const contentBlock = await sourceContentBlock(fileBytes, source.mimeType);
	const contexts = await getBrainContexts(supabase, source.brainId);
	const index = await getBrainPageIndex(supabase, source.brainId);
	const touchedPages = await getBrainPagesBySlugs(supabase, source.brainId, touchedSlugs);
	return unlearnSource(contentBlock, source.filename, brain, contexts, index, touchedPages);
}

async function recordRemovalEvents(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	rewrites: { slug: string }[],
	deletedSlugs: string[],
	deletedContexts: string[],
	record: RetirementRecord
): Promise<void> {
	for (const rewrite of rewrites) {
		await recordBrainEvent(supabase, {
			brainId: source.brainId,
			kind: 'page_updated',
			detail: {},
			pageSlug: rewrite.slug
		});
	}
	for (const slug of deletedSlugs) {
		await recordBrainEvent(supabase, {
			brainId: source.brainId,
			kind: 'page_deleted',
			detail: { pageSlug: slug }
		});
	}
	for (const slug of deletedContexts) {
		await recordBrainEvent(supabase, {
			brainId: source.brainId,
			kind: 'context_deleted',
			detail: { contextSlug: slug }
		});
	}
	await recordBrainEvent(supabase, {
		brainId: source.brainId,
		kind: 'source_removed',
		detail: { filename: source.filename, logLine: record.logLine }
	});
}
