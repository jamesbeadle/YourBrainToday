import type { SupabaseClient } from '@supabase/supabase-js';

export async function addMapViewer(
	supabase: SupabaseClient,
	ownerId: string,
	workflowId: string,
	viewerEmail: string
): Promise<void> {
	const { error } = await supabase.from('map_viewers').insert({
		owner_id: ownerId,
		workflow_id: workflowId,
		viewer_email: viewerEmail.toLowerCase()
	});
	if (error) throw error;
}
