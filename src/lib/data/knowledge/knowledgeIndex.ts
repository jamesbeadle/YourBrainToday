import type { KnowledgeKind } from './knowledgeKinds';

/** One line of the knowledge explorer: a page, an item or a process task, wherever it lives. */
export type KnowledgeIndexEntry = {
	id: string;
	kind: KnowledgeKind;
	kindLabel: string;
	brainId: string;
	brainName: string;
	title: string;
	summary: string;
	detail: string;
	date: string | null;
	href: string;
};

export type KnowledgeIndexSort = 'name' | 'newest';

export const summaryExcerptLength = 160;

export function excerptOf(body: string): string {
	const flattened = body.replace(/\s+/g, ' ').trim();
	if (flattened.length <= summaryExcerptLength) return flattened;
	return `${flattened.slice(0, summaryExcerptLength).trimEnd()}…`;
}

/** An item kind is stored as `snake_case`; people read it as a label. */
export function itemKindLabel(itemKind: string): string {
	const spaced = itemKind.replaceAll('_', ' ');
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
