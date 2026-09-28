import { parseBrainAnswer } from '$lib/server/brain/parseBrainAnswer';
import type { KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';

export type OrchestratedAnswer = {
	answerMarkdown: string;
	citedPageKeys: string[];
	brainsConsulted: KnowledgeKind[];
};

export function parseOrchestratedAnswer(input: unknown, kinds: KnowledgeKind[]): OrchestratedAnswer {
	const answer = parseBrainAnswer(input);
	return {
		answerMarkdown: answer.answerMarkdown,
		citedPageKeys: answer.citedSlugs,
		brainsConsulted: brainsConsultedFrom(input, kinds)
	};
}

function brainsConsultedFrom(input: unknown, kinds: KnowledgeKind[]): KnowledgeKind[] {
	if (typeof input !== 'object' || input === null) return [];
	const candidate = (input as { brainsConsulted?: unknown }).brainsConsulted;
	if (!Array.isArray(candidate)) return [];
	return kinds.filter((kind) => candidate.includes(kind));
}
