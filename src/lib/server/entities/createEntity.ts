import type { SupabaseClient } from '@supabase/supabase-js';

export async function createEntity(supabase: SupabaseClient, name: string): Promise<string> {
	const { data, error } = await supabase.from('entities').insert({ name }).select('id').single();
	if (error !== null) throw error;
	return data.id;
}
