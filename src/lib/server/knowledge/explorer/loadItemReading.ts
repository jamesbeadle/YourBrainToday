import { error } from '@sveltejs/kit';
import { itemRelationsOf, type ItemRelations } from './itemRelations';
import { getBrainItems } from '../getBrainItems';
import type { KbBrainItem, KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ItemReading = ItemRelations & { item: KbBrainItem };

/** One item of an experience or human brain, with what it is tied to. */
export async function loadItemReading(
	supabase: SupabaseClient,
	brain: KbBrainSummary,
	itemId: string
): Promise<ItemReading> {
	if (brain.category === 'domain') error(404, 'An expertise brain holds pages, not items');
	const items = await getBrainItems(supabase, brain.id);
	const item = items.find((candidate) => candidate.id === itemId);
	if (item === undefined) error(404, 'That item is not in this brain');
	return { item, ...itemRelationsOf(items, item) };
}
