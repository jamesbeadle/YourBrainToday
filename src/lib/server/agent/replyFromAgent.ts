import { env } from '$env/dynamic/private';
import { agentSystemPrompt } from './agentSystemPrompt';
import { agentReplyForTurn } from '$lib/data/scriptedAgent';
import { deriveInterviewState } from './deriveInterviewState';
import { parseHarvest, type HarvestedKnowledge, type HarvestPayload } from './parseHarvest';
import { parseWorkflowModel } from './parseWorkflowModel';
import { renderAgenda } from './interview/renderAgenda';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { toolUseFrom } from '$lib/server/anthropic/anthropicTypes';
import { workspaceUpdateTool } from './workspaceUpdateTool';
import type { ConversationTurn } from './conversationTypes';
import type { WorkflowModel } from '$lib/data/workflowModel';

const maxReplyTokens = 3000;

type WorkspaceUpdate = { reply: unknown; map: unknown } & HarvestPayload;

export type AgentTurn = { reply: string; map: WorkflowModel; harvest: HarvestedKnowledge };

const emptyHarvest: HarvestedKnowledge = {
	expertiseFacts: [],
	experienceEvents: [],
	people: [],
	connections: []
};

export async function replyFromAgent(
	conversation: ConversationTurn[],
	currentMap: WorkflowModel
): Promise<AgentTurn> {
	if (!env.ANTHROPIC_API_KEY) {
		return { reply: scriptedReply(conversation), map: currentMap, harvest: emptyHarvest };
	}
	const workspaceUpdate = await requestWorkspaceUpdate(conversation, currentMap);
	return {
		reply: asReplyText(workspaceUpdate.reply),
		map: parseWorkflowModel(workspaceUpdate.map) ?? currentMap,
		harvest: parseHarvest(workspaceUpdate)
	};
}

async function requestWorkspaceUpdate(
	conversation: ConversationTurn[],
	currentMap: WorkflowModel
): Promise<WorkspaceUpdate> {
	const response = await requestAnthropic({
		system: systemPromptWithMap(currentMap),
		messages: conversation.map(asAnthropicMessage),
		tools: [workspaceUpdateTool],
		forcedToolName: workspaceUpdateTool.name,
		maxTokens: maxReplyTokens
	});
	const workspaceUpdate = toolUseFrom(response, workspaceUpdateTool.name);
	if (workspaceUpdate === undefined) {
		throw new Error('Agent response contained no workspace update');
	}
	return workspaceUpdate as WorkspaceUpdate;
}

function systemPromptWithMap(currentMap: WorkflowModel): string {
	const agenda = renderAgenda(deriveInterviewState(currentMap));
	return `${agentSystemPrompt}\n\n${agenda}\n\n## Current Process Map model\n\n${JSON.stringify(currentMap)}`;
}

function asAnthropicMessage(turn: ConversationTurn) {
	return {
		role: turn.author === 'agent' ? ('assistant' as const) : ('user' as const),
		content: turn.body
	};
}

function asReplyText(reply: unknown): string {
	if (typeof reply === 'string' && reply.trim() !== '') return reply;
	return 'Tell me more about how that part of the business works.';
}

function scriptedReply(conversation: ConversationTurn[]): string {
	const userTurnCount = conversation.filter((turn) => turn.author === 'user').length;
	return agentReplyForTurn(userTurnCount);
}
