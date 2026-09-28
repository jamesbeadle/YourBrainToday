import { getLatestWorkflowMap } from '../../maps/getLatestWorkflowMap';
import { getProcessMaps } from '../getProcessMaps';
import { knowledgeReadingCaps } from '$lib/data/knowledge/knowledgeReadingCaps';
import { hasMapContent, type WorkflowModel } from '$lib/data/workflowModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ProcessMap = { name: string; model: WorkflowModel };

// Runs on the service client once the caller has proved they may read the
// knowledge base: the latest version
// of each Workflow Map under the knowledge base's entities, empty maps left out.
export async function readProcessMaps(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<ProcessMap[]> {
	const maps = await getProcessMaps(supabase, knowledgeBaseId);
	const processMaps: ProcessMap[] = [];
	for (const map of maps.slice(0, knowledgeReadingCaps.mostProcessMaps)) {
		const model = await getLatestWorkflowMap(supabase, map.id);
		if (!hasMapContent(model)) continue;
		processMaps.push({ name: map.name, model });
	}
	return processMaps;
}
