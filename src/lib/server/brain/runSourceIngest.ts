import { downloadSourceFile } from './downloadSourceFile';
import { getBrainContexts } from './getBrainContexts';
import { getBrainPageIndex } from './getBrainPageIndex';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import { routeSourceToBrains } from './routeSourceToBrains';
import { ingestSource } from './ingestSource';
import { markSourceStatus } from './findBrainSource';
import { recordBrainEvent } from './recordBrainEvent';
import { retireSupersededPages } from './retireSupersededPages';
import { saveBrainContextWrites } from './saveBrainContextWrites';
import { saveBrainPageWrites } from './saveBrainPageWrites';
import { sourceContentBlock } from './sourceContentBlock';
import { sweepEmptyBrainContexts } from './sweepEmptyBrainContexts';
import type { StoredBrainSource } from './findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function runSourceIngest(
	supabase: SupabaseClient,
	source: StoredBrainSource
): Promise<void> {
	const brain = await getDomainBrain(supabase, source.brainId);
	if (brain === null) throw new Error('That expertise brain no longer exists');
	const fileBytes = await downloadSourceFile(supabase, source.storagePath);
	const contentBlock = await sourceContentBlock(fileBytes, source.mimeType);
	const contexts = await getBrainContexts(supabase, source.brainId);
	const index = await getBrainPageIndex(supabase, source.brainId);
	const record = await ingestSource(contentBlock, source.filename, brain, contexts, index);
	const appliedContextWrites = await saveBrainContextWrites(
		supabase,
		source.brainId,
		record.contextWrites
	);
	const appliedPageWrites = await saveBrainPageWrites(supabase, source.brainId, record.pageWrites);
	await retireSupersededPages(supabase, source, record.pageRetires, index);
	await sweepEmptyBrainContexts(supabase, source.brainId, source.id);
	await recordContextEvents(supabase, source, appliedContextWrites);
	await recordPageEvents(supabase, source, appliedPageWrites);
	const routing = await routeSourceToBrains(supabase, source, contentBlock);
	await recordBrainEvent(supabase, {
		brainId: source.brainId,
		kind: 'source_ingested',
		detail: {
			filename: source.filename,
			logLine: `${record.logLine}${routing.logLine}`,
			experienceEpisodes: routing.experienceEpisodes,
			processTasks: routing.processTasks
		},
		sourceId: source.id
	});
	await markSourceStatus(supabase, source.id, 'ingested', record.sourceSummary);
}

async function recordContextEvents(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	appliedWrites: { slug: string; wasCreated: boolean }[]
): Promise<void> {
	for (const write of appliedWrites) {
		await recordBrainEvent(supabase, {
			brainId: source.brainId,
			kind: write.wasCreated ? 'context_created' : 'context_updated',
			detail: { contextSlug: write.slug },
			sourceId: source.id
		});
	}
}

async function recordPageEvents(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	appliedWrites: { slug: string; wasCreated: boolean }[]
): Promise<void> {
	for (const write of appliedWrites) {
		await recordBrainEvent(supabase, {
			brainId: source.brainId,
			kind: write.wasCreated ? 'page_created' : 'page_updated',
			detail: {},
			sourceId: source.id,
			pageSlug: write.slug
		});
	}
}
