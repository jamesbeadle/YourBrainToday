import { error } from '@sveltejs/kit';
import { pageNeighboursOf, type PageNeighbours } from './pageNeighbours';
import { getBrainContexts } from '$lib/server/brain/getBrainContexts';
import { getBrainPage } from '$lib/server/brain/getBrainPage';
import { getBrainPageIndex } from '$lib/server/brain/getBrainPageIndex';
import { getBrainPageLinks } from '$lib/server/brain/getBrainPageLinks';
import type { BrainContext, BrainPage } from '$lib/data/brainModelTypes';
import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type PageReading = PageNeighbours & {
	page: BrainPage;
	context: BrainContext | null;
};

/** A page of an expertise brain with everything that stands around it. */
export async function loadPageReading(
	supabase: SupabaseClient,
	brain: KbBrainSummary,
	slug: string
): Promise<PageReading> {
	const domainBrainId = requireDomainBrainId(brain);
	const [page, contexts, pageIndex, pageLinks] = await Promise.all([
		getBrainPage(supabase, domainBrainId, slug),
		getBrainContexts(supabase, domainBrainId),
		getBrainPageIndex(supabase, domainBrainId),
		getBrainPageLinks(supabase, domainBrainId)
	]);
	if (page === null) error(404, 'That page is not in this expertise brain');
	const context = contexts.find((candidate) => candidate.slug === page.contextSlug) ?? null;
	return { page, context, ...pageNeighboursOf(slug, page.contextSlug, pageIndex, pageLinks) };
}

export function requireDomainBrainId(brain: KbBrainSummary): string {
	if (brain.category !== 'domain' || brain.domainBrainId === null) {
		error(404, 'That brain has no pages to read');
	}
	return brain.domainBrainId;
}
