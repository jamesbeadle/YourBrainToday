import { error } from '@sveltejs/kit';
import { everyKnowledgeKind, isKnowledgeKind, type KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';

// "brains" names the brains a request is put to — a JSON array on a POST, a
// comma-separated query value on a GET. Absent means all four.
export function readKnowledgeKinds(candidate: unknown): KnowledgeKind[] {
	if (candidate === undefined || candidate === null || candidate === '') return everyKnowledgeKind;
	const names = typeof candidate === 'string' ? candidate.split(',').map((name) => name.trim()) : candidate;
	if (!Array.isArray(names) || names.length === 0 || !names.every(isKnowledgeKind)) {
		error(400, `brains must name only: ${everyKnowledgeKind.join(', ')}`);
	}
	return names;
}
