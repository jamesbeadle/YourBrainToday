import type { SupabaseClient } from '@supabase/supabase-js';

export type MapViewer = { id: number; email: string };

export async function getMapViewers(
	supabase: SupabaseClient,
	workflowId: string
): Promise<MapViewer[]> {
	const { data, error } = await supabase
		.from('map_viewers')
		.select('id, viewer_email')
		.eq('workflow_id', workflowId)
		.order('created_at');
	if (error) throw error;
	return data.map((row) => ({ id: row.id, email: row.viewer_email }));
}
