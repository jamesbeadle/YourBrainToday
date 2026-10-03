import { keepCitablePageKeys } from '$lib/server/knowledge/reading/honestCitations';
import { parseBrainAnswer } from '$lib/server/brain/parseBrainAnswer';
import type { KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';

export type OrchestratedAnswer = {
	answerMarkdown: string;
	citedPageKeys: string[];
	pagesRead: string[];
	brainsConsulted: KnowledgeKind[];
};

// What the exchange can vouch for: the pages fetched during it and the keys
// the index names. A citation outside both is dropped.
export type ReadingEvidence = { pagesRead: string[]; indexedKeys: string[] };

export function parseOrchestratedAnswer(
	input: unknown,
	kinds: KnowledgeKind[],
	evidence?: ReadingEvidence
): OrchestratedAnswer {
	const answer = parseBrainAnswer(input);
	return {
		answerMarkdown: answer.answerMarkdown,
		citedPageKeys: citedPageKeysFrom(answer.citedSlugs, evidence),
		pagesRead: evidence?.pagesRead ?? [],
		brainsConsulted: brainsConsultedFrom(input, kinds)
	};
}

function citedPageKeysFrom(citedSlugs: string[], evidence?: ReadingEvidence): string[] {
	if (evidence === undefined) return citedSlugs;
	return keepCitablePageKeys(citedSlugs, [...evidence.pagesRead, ...evidence.indexedKeys]);
}

function brainsConsultedFrom(input: unknown, kinds: KnowledgeKind[]): KnowledgeKind[] {
	if (typeof input !== 'object' || input === null) return [];
	const candidate = (input as { brainsConsulted?: unknown }).brainsConsulted;
	if (!Array.isArray(candidate)) return [];
	return kinds.filter((kind) => candidate.includes(kind));
}
