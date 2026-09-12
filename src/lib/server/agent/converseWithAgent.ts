import { fileHarvestedKnowledge } from './fileHarvestedKnowledge';
import { getLatestWorkflowMap } from '$lib/server/maps/getLatestWorkflowMap';
import { getSessionConversation } from './getSessionConversation';
import { recordAgentMessage } from './recordAgentMessage';
import { replyFromAgent, type AgentTurn } from './replyFromAgent';
import { saveWorkflowMap } from '$lib/server/maps/saveWorkflowMap';
import type { Workflow } from '$lib/server/entities/getWorkflow';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function converseWithAgent(
	supabase: SupabaseClient,
	userId: string,
	sessionId: string,
	workflow: Workflow,
	message: string
): Promise<AgentTurn> {
	const authorship = { sessionId, userId, workflowId: workflow.id };
	await recordAgentMessage(supabase, { ...authorship, author: 'user', body: message });
	const conversation = await getSessionConversation(supabase, sessionId);
	const currentMap = await getLatestWorkflowMap(supabase, workflow.id);
	const agentTurn = await replyFromAgent(conversation, currentMap);
	await recordAgentMessage(supabase, { ...authorship, author: 'agent', body: agentTurn.reply });
	if (JSON.stringify(agentTurn.map) !== JSON.stringify(currentMap)) {
		await saveWorkflowMap(supabase, workflow.id, agentTurn.map);
	}
	await fileHarvestedKnowledge(supabase, workflow.entityId, agentTurn.harvest);
	return agentTurn;
}
