import type { SupabaseClient } from '@supabase/supabase-js';

export type Entity = {
	id: string;
	name: string;
};

export async function getEntity(
	supabase: SupabaseClient,
	entityId: string
): Promise<Entity | null> {
	const { data, error } = await supabase
		.from('entities')
		.select('id, name')
		.eq('id', entityId)
		.maybeSingle();
	if (error !== null) throw error;
	return data;
}
