import type { SupabaseClient } from '@supabase/supabase-js';
import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

type BrainItemRow = {
	id: string;
	item_kind: string;
	title: string;
	body: string;
	data: Record<string, unknown>;
	parent_item_id: string | null;
	position: number;
	occurred_at: string | null;
	valid_from: string | null;
	valid_to: string | null;
	created_at: string;
};

export async function getBrainItems(
	supabase: SupabaseClient,
	brainId: string
): Promise<KbBrainItem[]> {
	const { data, error } = await supabase
		.from('kb_brain_items')
		.select(
			'id, item_kind, title, body, data, parent_item_id, position, occurred_at, valid_from, valid_to, created_at'
		)
		.eq('brain_id', brainId)
		.order('position')
		.order('created_at');
	if (error !== null) throw error;
	return ((data ?? []) as BrainItemRow[]).map(toBrainItem);
}

function toBrainItem(row: BrainItemRow): KbBrainItem {
	return {
		id: row.id,
		itemKind: row.item_kind,
		title: row.title,
		body: row.body,
		data: row.data ?? {},
		parentItemId: row.parent_item_id,
		position: row.position,
		occurredAt: row.occurred_at,
		validFrom: row.valid_from,
		validTo: row.valid_to,
		createdAt: row.created_at
	};
}
