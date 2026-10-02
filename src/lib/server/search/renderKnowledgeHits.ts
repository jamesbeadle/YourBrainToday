import type { ExpertiseBrainModel } from '$lib/server/knowledge/reading/readExpertiseBrains';
import type { KnowledgeHit } from './searchKnowledgeBase';

export type KeyedKnowledgeHit = KnowledgeHit & { pageKey: string | null; brainName: string };

const unnamedBrain = 'a brain';

/**
 * Hits as an agent reads them: an expertise page by the key read_pages
 * takes, an item by the brain it sits in, each with the snippet that
 * matched.
 */
export function renderKnowledgeHits(
	hits: KnowledgeHit[],
	expertise: ExpertiseBrainModel[],
	brainNames: Map<string, string>
): string {
	if (hits.length === 0) return 'Nothing in the knowledge base matches those words.';
	return hitsWithPageKeys(hits, expertise, brainNames).map(renderHit).join('\n');
}

export function hitsWithPageKeys(
	hits: KnowledgeHit[],
	expertise: ExpertiseBrainModel[],
	brainNames: Map<string, string>
): KeyedKnowledgeHit[] {
	return hits.map((hit) => ({
		...hit,
		pageKey: hit.hitKind === 'page' ? pageKeyFor(hit, expertise) : null,
		brainName: brainNames.get(hit.brainId) ?? expertiseNameFor(hit, expertise)
	}));
}

function renderHit(hit: KeyedKnowledgeHit): string {
	if (hit.pageKey !== null) return `- page ${hit.pageKey} — ${hit.title}: ${hit.snippet}`;
	return `- ${hit.itemKind} in ${hit.brainName} — ${hit.title}: ${hit.snippet}`;
}

export function pageKeyFor(hit: KnowledgeHit, expertise: ExpertiseBrainModel[]): string {
	const brain = expertise.find((candidate) => candidate.kbBrainId === hit.brainId);
	return brain === undefined ? `${hit.slug}` : `${brain.handle}/${hit.slug}`;
}

function expertiseNameFor(hit: KnowledgeHit, expertise: ExpertiseBrainModel[]): string {
	return expertise.find((candidate) => candidate.kbBrainId === hit.brainId)?.name ?? unnamedBrain;
}
