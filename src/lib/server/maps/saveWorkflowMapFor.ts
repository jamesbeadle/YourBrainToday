import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { WorkflowModel } from '$lib/data/workflowModel';

/** A map redrawn on the owner's behalf — from a document read for them — is saved in their name. */
export async function saveWorkflowMapFor(
	ownerId: string,
	workflowId: string,
	model: WorkflowModel
): Promise<void> {
	const { error } = await supabaseServiceClient().rpc('save_workflow_map_for', {
		map_owner: ownerId,
		map_workflow_id: workflowId,
		map_model: model
	});
	if (error) throw error;
}
