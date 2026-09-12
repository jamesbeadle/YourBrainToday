import type { SupabaseClient } from '@supabase/supabase-js';

export async function deleteWorkspaceShare(
	supabase: SupabaseClient,
	shareId: string
): Promise<void> {
	const { error } = await supabase.from('workspace_shares').delete().eq('id', shareId);
	if (error !== null) throw error;
}
