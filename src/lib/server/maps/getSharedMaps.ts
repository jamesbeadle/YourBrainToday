import { parseWorkflowModel } from '$lib/server/agent/parseWorkflowModel';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkflowModel } from '$lib/data/workflowModel';

export type SharedWorkflowSummary = {
	workflowId: string;
	workflowName: string;
	entityName: string;
	ownerEmail: string;
	version: number;
	updatedAt: string;
};

export async function getSharedWorkflowSummaries(
	supabase: SupabaseClient
): Promise<SharedWorkflowSummary[]> {
	const { data, error } = await supabase.rpc('shared_maps_for_viewer');
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => ({
		workflowId: row.workflow_id as string,
		workflowName: row.workflow_name as string,
		entityName: row.entity_name as string,
		ownerEmail: row.owner_email as string,
		version: row.version as number,
		updatedAt: row.updated_at as string
	}));
}

export async function getSharedMap(
	supabase: SupabaseClient,
	workflowId: string
): Promise<WorkflowModel | null> {
	const { data, error } = await supabase.rpc('get_shared_map', {
		shared_workflow_id: workflowId
	});
	if (error === null) return parseWorkflowModel(data);
	if (error.message.includes('not_shared')) return null;
	throw error;
}
