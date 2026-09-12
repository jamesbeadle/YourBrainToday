import type { SupabaseClient } from '@supabase/supabase-js';

export async function createWorkflow(
	supabase: SupabaseClient,
	entityId: string,
	name: string
): Promise<string> {
	const { data, error } = await supabase
		.from('workflows')
		.insert({ entity_id: entityId, name })
		.select('id')
		.single();
	if (error !== null) throw error;
	return data.id;
}
