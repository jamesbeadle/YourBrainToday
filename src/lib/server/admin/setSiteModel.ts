import type { SupabaseClient } from '@supabase/supabase-js';

export async function setSiteModel(supabase: SupabaseClient, modelId: string): Promise<void> {
	const { error } = await supabase.rpc('admin_set_site_model', { new_model: modelId });
	if (error) throw error;
}
