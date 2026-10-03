import { getBrainItems } from '../getBrainItems';
import {
	excerptOf,
	itemKindLabel,
	type KnowledgeIndexEntry
} from '$lib/data/knowledge/knowledgeIndex';
import { itemHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import { kindForCategory } from '$lib/data/knowledge/knowledgeKinds';
import type { KbBrainItem, KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function indexBrainItems(
	supabase: SupabaseClient,
	brain: KbBrainSummary
): Promise<KnowledgeIndexEntry[]> {
	const items = await getBrainItems(supabase, brain.id);
	const titleById = new Map(items.map((item) => [item.id, item.title]));
	return items.map((item) => itemEntry(brain, item, titleById));
}

function itemEntry(
	brain: KbBrainSummary,
	item: KbBrainItem,
	titleById: Map<string, string>
): KnowledgeIndexEntry {
	const parentTitle = item.parentItemId === null ? '' : (titleById.get(item.parentItemId) ?? '');
	return {
		id: `item:${item.id}`,
		kind: kindForCategory(brain.category).kind,
		kindLabel: itemKindLabel(item.itemKind),
		brainId: brain.id,
		brainName: brain.name,
		title: item.title,
		summary: excerptOf(item.body),
		detail: parentTitle,
		date: item.occurredAt ?? item.createdAt,
		href: itemHref(brain.knowledgeBaseId, brain.id, item.id)
	};
}
