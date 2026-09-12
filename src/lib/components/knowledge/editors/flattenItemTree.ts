import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

export type TreeEntry = { item: KbBrainItem; depth: number };

export function flattenItemTree(items: KbBrainItem[]): TreeEntry[] {
	const entries: TreeEntry[] = [];
	for (const rootItem of childrenOf(items, null)) {
		appendBranch(items, rootItem, 0, entries);
	}
	return entries;
}

function appendBranch(
	items: KbBrainItem[],
	item: KbBrainItem,
	depth: number,
	entries: TreeEntry[]
): void {
	entries.push({ item, depth });
	for (const childItem of childrenOf(items, item.id)) {
		appendBranch(items, childItem, depth + 1, entries);
	}
}

function childrenOf(items: KbBrainItem[], parentItemId: string | null): KbBrainItem[] {
	return items.filter((item) => item.parentItemId === parentItemId);
}
