import { getProcessMaps } from './getProcessMaps';
import { getLatestWorkflowMap } from '$lib/server/maps/getLatestWorkflowMap';
import type { WorkflowModel } from '$lib/data/workflowModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export type InterviewProcessMap = { workflowId: string; model: WorkflowModel };

/** The knowledge base's first process map — the one the interview redraws, as the Cartographer does. */
export async function findInterviewProcessMap(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<InterviewProcessMap | null> {
	const [workflow] = await getProcessMaps(supabase, knowledgeBaseId);
	if (workflow === undefined) return null;
	const model = await getLatestWorkflowMap(supabase, workflow.id);
	return { workflowId: workflow.id, model };
}
