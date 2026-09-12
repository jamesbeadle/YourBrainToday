import type { SupabaseClient } from '@supabase/supabase-js';

export async function getDisplayName(supabase: SupabaseClient): Promise<string> {
	const { data, error } = await supabase.from('profiles').select('display_name').maybeSingle();
	if (error) throw error;
	return data?.display_name ?? '';
}
