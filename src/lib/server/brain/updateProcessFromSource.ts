import { processMapPrompt, processMapUpdateTool } from './processMapPrompt';
import { allTasks, type WorkflowModel } from '$lib/data/workflowModel';
import { parseWorkflowModel } from '$lib/server/agent/parseWorkflowModel';
import { requestToolCall } from '$lib/server/anthropic/requestToolCall';

const maxMapTokens = 12_000;

export type ProcessMapUpdate = { map: WorkflowModel; changeNote: string; tasksAdded: number };

export async function updateProcessFromSource(
	contentBlock: unknown,
	filename: string,
	businessName: string,
	currentMap: WorkflowModel
): Promise<ProcessMapUpdate> {
	const update = (await requestToolCall(
		{
			system: processMapPrompt(businessName, currentMap),
			messages: [{ role: 'user', content: [instructionBlock(filename), contentBlock] }],
			tools: [processMapUpdateTool],
			maxTokens: maxMapTokens
		},
		processMapUpdateTool.name
	)) as { map?: unknown; changeNote?: unknown };
	const map = parseWorkflowModel(update.map) ?? currentMap;
	return {
		map,
		changeNote: typeof update.changeNote === 'string' ? update.changeNote : '',
		tasksAdded: Math.max(0, allTasks(map).length - allTasks(currentMap).length)
	};
}

function instructionBlock(filename: string) {
	return {
		type: 'text',
		text: `Update the Process Map from this source document. Its filename is "${filename}".`
	};
}
