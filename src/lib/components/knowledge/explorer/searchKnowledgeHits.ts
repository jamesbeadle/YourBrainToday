import { domainBlockLabels } from '$lib/data/domainBlocks';
import { isDomainBlockKind } from '$lib/data/domainBlocks';
import { itemKindLabel } from '$lib/data/knowledge/knowledgeIndex';
import { itemHref, pageHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import type { KnowledgeHit } from '$lib/server/search/searchKnowledgeBase';

export type KnowledgeSearchHit = {
	id: string;
	title: string;
	snippet: string;
	kindLabel: string;
	brainName: string;
	href: string;
};

/** Asks the knowledge base's search for ranked hits over the bodies, each linked to its reader. */
export async function searchKnowledgeHits(
	knowledgeBaseId: string,
	query: string,
	brainNameFor: (brainId: string) => string
): Promise<KnowledgeSearchHit[]> {
	const parameters = new URLSearchParams({ q: query });
	const response = await fetch(`/api/knowledge-base/${knowledgeBaseId}/search?${parameters}`);
	if (!response.ok) throw new Error('The search did not answer');
	const { hits } = (await response.json()) as { hits: KnowledgeHit[] };
	return hits.map((hit) => asSearchHit(knowledgeBaseId, hit, brainNameFor));
}

function asSearchHit(
	knowledgeBaseId: string,
	hit: KnowledgeHit,
	brainNameFor: (brainId: string) => string
): KnowledgeSearchHit {
	return {
		id: hit.itemId,
		title: hit.title,
		snippet: hit.snippet,
		kindLabel: kindLabelOf(hit),
		brainName: brainNameFor(hit.brainId),
		href: hrefOf(knowledgeBaseId, hit)
	};
}

function kindLabelOf(hit: KnowledgeHit): string {
	if (hit.hitKind === 'page' && isDomainBlockKind(hit.itemKind)) {
		return domainBlockLabels[hit.itemKind].singular;
	}
	return itemKindLabel(hit.itemKind);
}

function hrefOf(knowledgeBaseId: string, hit: KnowledgeHit): string {
	if (hit.hitKind === 'page' && hit.slug !== null) {
		return pageHref(knowledgeBaseId, hit.brainId, hit.slug);
	}
	return itemHref(knowledgeBaseId, hit.brainId, hit.itemId);
}
