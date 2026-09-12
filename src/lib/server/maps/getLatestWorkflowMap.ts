import { emptyWorkflowModel, type WorkflowModel } from '$lib/data/workflowModel';
import { parseWorkflowModel } from '$lib/server/agent/parseWorkflowModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getLatestWorkflowMap(
	supabase: SupabaseClient,
	workflowId: string
): Promise<WorkflowModel> {
	const { data, error } = await supabase
		.from('workflow_maps')
		.select('model')
		.eq('workflow_id', workflowId)
		.order('version', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return emptyWorkflowModel;
	return parseWorkflowModel(data.model) ?? emptyWorkflowModel;
}
