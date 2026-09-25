import { peopleHarvestPrompt, peopleHarvestTool } from './peopleHarvestPrompt';
import { parseHarvest } from '$lib/server/agent/parseHarvest';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { toolUseFrom } from '$lib/server/anthropic/anthropicTypes';
import type { HumanNetwork } from '$lib/server/knowledge/humanWriter';

const maxHarvestTokens = 6000;

export async function harvestDocumentPeople(
	contentBlock: unknown,
	filename: string,
	brainName: string,
	knownPeople: string[]
): Promise<HumanNetwork> {
	const response = await requestAnthropic({
		system: peopleHarvestPrompt(brainName, knownPeople),
		messages: [{ role: 'user', content: [instructionBlock(filename), contentBlock] }],
		tools: [peopleHarvestTool],
		forcedToolName: peopleHarvestTool.name,
		maxTokens: maxHarvestTokens
	});
	const harvest = toolUseFrom(response, peopleHarvestTool.name);
	if (harvest === undefined) throw new Error('The people harvest produced no result');
	const { people, connections } = parseHarvest(harvest as Record<string, unknown>);
	return { people, connections };
}

function instructionBlock(filename: string) {
	return {
		type: 'text',
		text: `Harvest the people and relationships in this source document. Its filename is "${filename}".`
	};
}
