import type { SupabaseClient } from '@supabase/supabase-js';

export type IndexedHumanItem = { id: string; title: string; data: Record<string, unknown> };

export async function getHumanItems(
	supabase: SupabaseClient,
	brainId: string,
	itemKind: string
): Promise<IndexedHumanItem[]> {
	const { data, error } = await supabase
		.from('kb_brain_items')
		.select('id, title, data')
		.eq('brain_id', brainId)
		.eq('item_kind', itemKind);
	if (error !== null) throw error;
	return (data ?? []) as IndexedHumanItem[];
}

export async function saveConnectionFeeling(
	supabase: SupabaseClient,
	connection: IndexedHumanItem,
	feeling: { warmth: string; note: string }
): Promise<void> {
	const { error } = await supabase
		.from('kb_brain_items')
		.update({
			body: feeling.note,
			data: { ...connection.data, warmth: feeling.warmth },
			updated_at: new Date().toISOString()
		})
		.eq('id', connection.id);
	if (error !== null) throw error;
}

export function nameKey(name: string): string {
	return name.trim().toLowerCase();
}
