import type { SupabaseClient } from '@supabase/supabase-js';

export async function deleteBrainItem(supabase: SupabaseClient, itemId: string): Promise<void> {
	const { error } = await supabase.from('kb_brain_items').delete().eq('id', itemId);
	if (error !== null) throw error;
}
