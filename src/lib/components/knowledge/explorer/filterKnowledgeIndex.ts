import type { KnowledgeIndexEntry, KnowledgeIndexSort } from '$lib/data/knowledge/knowledgeIndex';
import type { KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';

export type KnowledgeIndexFilter = {
	text: string;
	brainIds: string[];
	kinds: KnowledgeKind[];
	sort: KnowledgeIndexSort;
};

export const unfilteredKnowledgeIndex: KnowledgeIndexFilter = {
	text: '',
	brainIds: [],
	kinds: [],
	sort: 'name'
};

/** The list narrows as you type over titles and summaries; chips narrow by brain and by kind. */
export function filterKnowledgeIndex(
	entries: KnowledgeIndexEntry[],
	filter: KnowledgeIndexFilter
): KnowledgeIndexEntry[] {
	const needle = filter.text.trim().toLowerCase();
	const matching = entries.filter(
		(entry) =>
			isInChosenBrains(entry, filter.brainIds) &&
			isOfChosenKinds(entry, filter.kinds) &&
			mentions(entry, needle)
	);
	return matching.toSorted(filter.sort === 'newest' ? byNewest : byName);
}

function isInChosenBrains(entry: KnowledgeIndexEntry, brainIds: string[]): boolean {
	return brainIds.length === 0 || brainIds.includes(entry.brainId);
}

function isOfChosenKinds(entry: KnowledgeIndexEntry, kinds: KnowledgeKind[]): boolean {
	return kinds.length === 0 || kinds.includes(entry.kind);
}

function mentions(entry: KnowledgeIndexEntry, needle: string): boolean {
	if (needle === '') return true;
	return `${entry.title} ${entry.summary} ${entry.detail}`.toLowerCase().includes(needle);
}

function byName(first: KnowledgeIndexEntry, second: KnowledgeIndexEntry): number {
	return first.title.localeCompare(second.title);
}

/** Undated entries sort after every dated one, by name among themselves. */
function byNewest(first: KnowledgeIndexEntry, second: KnowledgeIndexEntry): number {
	if (first.date === null && second.date === null) return byName(first, second);
	if (first.date === null) return 1;
	if (second.date === null) return -1;
	return second.date.localeCompare(first.date);
}

export function toggled<Value>(chosen: Value[], value: Value): Value[] {
	if (chosen.includes(value)) return chosen.filter((candidate) => candidate !== value);
	return [...chosen, value];
}
