import type { SupabaseClient } from '@supabase/supabase-js';

export async function deleteKbBrain(supabase: SupabaseClient, brainId: string): Promise<void> {
	const { error } = await supabase.from('kb_brains').delete().eq('id', brainId);
	if (error !== null) throw error;
}
