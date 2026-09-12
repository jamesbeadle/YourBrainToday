import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkflowModel } from '$lib/data/workflowModel';

export async function saveWorkflowMap(
	supabase: SupabaseClient,
	workflowId: string,
	model: WorkflowModel
): Promise<void> {
	const { error } = await supabase.rpc('save_workflow_map', {
		map_model: model,
		map_workflow_id: workflowId
	});
	if (error) throw error;
}
