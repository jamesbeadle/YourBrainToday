import { deleteBrainPages, deleteEmptyBrainContexts } from './deleteBrainPages';
import { recordBrainEvent } from './recordBrainEvent';
import type { BrainPageSummary } from '$lib/data/brainTypes';
import type { StoredBrainSource } from './findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function retireSupersededPages(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	retireSlugs: string[],
	index: BrainPageSummary[]
): Promise<void> {
	const safeSlugs = retireSlugs.filter((slug) => isRetirable(slug, index));
	const deletedSlugs = await deleteBrainPages(supabase, source.brainId, safeSlugs);
	const emptiedContexts = await deleteEmptyBrainContexts(
		supabase,
		source.brainId,
		contextSlugsOf(deletedSlugs, index)
	);
	await recordRetirementEvents(supabase, source, deletedSlugs, emptiedContexts);
}

function isRetirable(slug: string, index: BrainPageSummary[]): boolean {
	const page = index.find((candidate) => candidate.slug === slug);
	if (page === undefined) return false;
	return page.kind !== 'context_map';
}

function contextSlugsOf(slugs: string[], index: BrainPageSummary[]): string[] {
	const contextSlugs = index
		.filter((page) => slugs.includes(page.slug))
		.flatMap((page) => (page.contextSlug === null ? [] : [page.contextSlug]));
	return [...new Set(contextSlugs)];
}

async function recordRetirementEvents(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	deletedSlugs: string[],
	emptiedContexts: string[]
): Promise<void> {
	for (const slug of deletedSlugs) {
		await recordBrainEvent(supabase, {
			brainId: source.brainId,
			kind: 'page_deleted',
			detail: { pageSlug: slug },
			sourceId: source.id
		});
	}
	for (const slug of emptiedContexts) {
		await recordBrainEvent(supabase, {
			brainId: source.brainId,
			kind: 'context_deleted',
			detail: { contextSlug: slug },
			sourceId: source.id
		});
	}
}
