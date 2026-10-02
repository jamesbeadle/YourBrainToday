import { momentOf } from '../editors/caseGrouping';
import { itemHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import type { ItemLink } from './ItemLinkList.svelte';
import type { ConnectionEnd } from '$lib/server/knowledge/explorer/itemRelations';
import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

export function dateLabel(moment: string): string {
	return new Date(moment).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

export function childLinks(
	knowledgeBaseId: string,
	brainId: string,
	children: KbBrainItem[]
): ItemLink[] {
	return children.map((child) => ({
		label: child.title,
		href: itemHref(knowledgeBaseId, brainId, child.id),
		detail: dateLabel(momentOf(child))
	}));
}

export function connectionLinks(
	knowledgeBaseId: string,
	brainId: string,
	ends: ConnectionEnd[]
): ItemLink[] {
	return ends.map((end) => ({
		label: end.name,
		href: end.itemId === null ? null : itemHref(knowledgeBaseId, brainId, end.itemId)
	}));
}
