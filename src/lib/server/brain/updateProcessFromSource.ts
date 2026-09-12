import { processMapPrompt, processMapUpdateTool } from './processMapPrompt';
import { allTasks, type WorkflowModel } from '$lib/data/workflowModel';
import { parseWorkflowModel } from '$lib/server/agent/parseWorkflowModel';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { toolUseFrom } from '$lib/server/anthropic/anthropicTypes';

const maxMapTokens = 12_000;

export type ProcessMapUpdate = { map: WorkflowModel; changeNote: string; tasksAdded: number };

export async function updateProcessFromSource(
	contentBlock: unknown,
	filename: string,
	businessName: string,
	currentMap: WorkflowModel
): Promise<ProcessMapUpdate> {
	const response = await requestAnthropic({
		system: processMapPrompt(businessName, currentMap),
		messages: [{ role: 'user', content: [instructionBlock(filename), contentBlock] }],
		tools: [processMapUpdateTool],
		forcedToolName: processMapUpdateTool.name,
		maxTokens: maxMapTokens
	});
	if (response.stop_reason === 'max_tokens') {
		throw new Error('The map update ran out of room before finishing');
	}
	const update = toolUseFrom(response, processMapUpdateTool.name) as
		| { map?: unknown; changeNote?: unknown }
		| undefined;
	if (update === undefined) throw new Error('The map update produced no result');
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
