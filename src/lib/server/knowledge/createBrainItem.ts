import type { SupabaseClient } from '@supabase/supabase-js';

type NewBrainItem = {
	brainId: string;
	itemKind: string;
	title: string;
	body?: string;
	data?: Record<string, unknown>;
	parentItemId?: string | null;
	position?: number;
	occurredAt?: string | null;
	validFrom?: string | null;
	validTo?: string | null;
};

export async function createBrainItem(
	supabase: SupabaseClient,
	item: NewBrainItem
): Promise<string> {
	const { data, error } = await supabase
		.from('kb_brain_items')
		.insert({
			brain_id: item.brainId,
			item_kind: item.itemKind,
			title: item.title,
			body: item.body ?? '',
			data: item.data ?? {},
			parent_item_id: item.parentItemId ?? null,
			position: item.position ?? 0,
			occurred_at: item.occurredAt ?? null,
			valid_from: item.validFrom ?? null,
			valid_to: item.validTo ?? null
		})
		.select('id')
		.single();
	if (error !== null) throw error;
	return data.id;
}
