import type { SupabaseClient } from '@supabase/supabase-js';

export async function deleteUserAccount(
	supabase: SupabaseClient,
	targetEmail: string
): Promise<void> {
	const { error } = await supabase.rpc('admin_delete_user', { target_email: targetEmail });
	if (error) throw error;
}
