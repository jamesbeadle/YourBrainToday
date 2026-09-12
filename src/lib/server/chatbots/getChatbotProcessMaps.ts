import { getLatestWorkflowMap } from '../maps/getLatestWorkflowMap';
import { getProcessMaps } from '../knowledge/getProcessMaps';
import { chatbotKnowledgeCaps } from '$lib/data/chatbotKnowledgeCaps';
import { hasMapContent, type WorkflowModel } from '$lib/data/workflowModel';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatbotProcessMap = { name: string; model: WorkflowModel };

// Runs on the service client after membership is proven: the latest version
// of each Workflow Map under the knowledge base's entities, empty maps left out.
export async function getChatbotProcessMaps(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<ChatbotProcessMap[]> {
	const maps = await getProcessMaps(supabase, knowledgeBaseId);
	const processMaps: ChatbotProcessMap[] = [];
	for (const map of maps.slice(0, chatbotKnowledgeCaps.mostProcessMaps)) {
		const model = await getLatestWorkflowMap(supabase, map.id);
		if (!hasMapContent(model)) continue;
		processMaps.push({ name: map.name, model });
	}
	return processMaps;
}
