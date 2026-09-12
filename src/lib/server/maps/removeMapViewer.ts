import type { SupabaseClient } from '@supabase/supabase-js';

export async function removeMapViewer(supabase: SupabaseClient, viewerId: number): Promise<void> {
	const { error } = await supabase.from('map_viewers').delete().eq('id', viewerId);
	if (error) throw error;
}
