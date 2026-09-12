import type { SupabaseClient } from '@supabase/supabase-js';

export async function setUserModel(
	supabase: SupabaseClient,
	targetEmail: string,
	modelId: string
): Promise<void> {
	const { error } = await supabase.rpc('admin_set_user_model', {
		target_email: targetEmail,
		new_model: modelId
	});
	if (error) throw error;
}

export async function getModelOverridesByEmail(
	supabase: SupabaseClient
): Promise<Map<string, string>> {
	const { data, error } = await supabase.rpc('admin_list_model_overrides');
	if (error) throw error;
	const overrides = new Map<string, string>();
	for (const row of data as { email: string; model_id: string }[]) {
		overrides.set(row.email, row.model_id);
	}
	return overrides;
}
