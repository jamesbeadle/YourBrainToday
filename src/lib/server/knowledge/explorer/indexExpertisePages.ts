import { getBrainContexts } from '$lib/server/brain/getBrainContexts';
import { getBrainPageIndex } from '$lib/server/brain/getBrainPageIndex';
import { domainBlockLabels } from '$lib/data/domainBlocks';
import { pageHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import type { BrainContext, BrainPageSummary } from '$lib/data/brainModelTypes';
import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
import type { KnowledgeIndexEntry } from '$lib/data/knowledge/knowledgeIndex';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function indexExpertisePages(
	supabase: SupabaseClient,
	brain: KbBrainSummary
): Promise<KnowledgeIndexEntry[]> {
	if (brain.domainBrainId === null) return [];
	const [contexts, pageIndex] = await Promise.all([
		getBrainContexts(supabase, brain.domainBrainId),
		getBrainPageIndex(supabase, brain.domainBrainId)
	]);
	return pageIndex.map((page) => pageEntry(brain, page, contexts));
}

function pageEntry(
	brain: KbBrainSummary,
	page: BrainPageSummary,
	contexts: BrainContext[]
): KnowledgeIndexEntry {
	const context = contexts.find((candidate) => candidate.slug === page.contextSlug);
	return {
		id: `page:${brain.id}:${page.slug}`,
		kind: 'expertise',
		kindLabel: domainBlockLabels[page.kind].singular,
		brainId: brain.id,
		brainName: brain.name,
		title: page.title,
		summary: page.summary,
		detail: context?.name ?? '',
		date: null,
		href: pageHref(brain.knowledgeBaseId, brain.id, page.slug)
	};
}
