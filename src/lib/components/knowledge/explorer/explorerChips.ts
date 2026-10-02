import { knowledgeKinds } from '$lib/data/knowledge/knowledgeKinds';
import type { Chip } from './ExplorerChips.svelte';
import type { KnowledgeIndexEntry } from '$lib/data/knowledge/knowledgeIndex';

/** Only the brains and kinds that hold something are worth a chip. */
export function brainChipsFrom(entries: KnowledgeIndexEntry[]): Chip[] {
	const namesById = new Map(entries.map((entry) => [entry.brainId, entry.brainName]));
	return [...namesById].map(([key, label]) => ({ key, label }));
}

export function kindChipsFrom(entries: KnowledgeIndexEntry[]): Chip[] {
	const presentKinds = new Set(entries.map((entry) => entry.kind));
	return knowledgeKinds
		.filter((definition) => presentKinds.has(definition.kind))
		.map((definition) => ({ key: definition.kind, label: definition.label, accent: definition.accent }));
}
