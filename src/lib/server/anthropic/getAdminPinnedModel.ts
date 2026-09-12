import type { SupabaseClient } from '@supabase/supabase-js';

export async function getAdminPinnedModel(supabase: SupabaseClient): Promise<string | null> {
	const { data, error } = await supabase
		.from('user_model_overrides')
		.select('model_id')
		.maybeSingle();
	if (error !== null) throw error;
	return data?.model_id ?? null;
}
