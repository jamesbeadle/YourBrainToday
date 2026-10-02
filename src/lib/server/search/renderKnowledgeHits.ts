import type { ExpertiseBrainModel } from '$lib/server/knowledge/reading/readExpertiseBrains';
import type { KnowledgeHit } from './searchKnowledgeBase';

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
	return hits.map((hit) => renderHit(hit, expertise, brainNames)).join('\n');
}

function renderHit(
	hit: KnowledgeHit,
	expertise: ExpertiseBrainModel[],
	brainNames: Map<string, string>
): string {
	if (hit.hitKind === 'page') {
		return `- page ${pageKeyFor(hit, expertise)} — ${hit.title}: ${hit.snippet}`;
	}
	const brainName = brainNames.get(hit.brainId) ?? 'a brain';
	return `- ${hit.itemKind} in ${brainName} — ${hit.title}: ${hit.snippet}`;
}

export function pageKeyFor(hit: KnowledgeHit, expertise: ExpertiseBrainModel[]): string {
	const brain = expertise.find((candidate) => candidate.kbBrainId === hit.brainId);
	return brain === undefined ? `${hit.slug}` : `${brain.handle}/${hit.slug}`;
}
