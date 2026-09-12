import type { SupabaseClient } from '@supabase/supabase-js';

export async function saveDisplayName(
	supabase: SupabaseClient,
	displayName: string
): Promise<void> {
	const { error } = await supabase.rpc('set_display_name', { new_display_name: displayName });
	if (error) throw error;
}
