import type { SupabaseClient } from '@supabase/supabase-js';

export async function deleteEntity(supabase: SupabaseClient, entityId: string): Promise<void> {
	const { error } = await supabase.from('entities').delete().eq('id', entityId);
	if (error !== null) throw error;
}
