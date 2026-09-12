import type { SupabaseClient } from '@supabase/supabase-js';

export async function getUserModelPreference(supabase: SupabaseClient): Promise<string | null> {
	const { data, error } = await supabase
		.from('user_model_preferences')
		.select('model_id')
		.maybeSingle();
	if (error !== null) throw error;
	return data?.model_id ?? null;
}

export async function saveUserModelPreference(
	supabase: SupabaseClient,
	userId: string,
	modelId: string
): Promise<void> {
	const { error } = await supabase
		.from('user_model_preferences')
		.upsert({ user_id: userId, model_id: modelId, updated_at: new Date().toISOString() });
	if (error !== null) throw error;
}
