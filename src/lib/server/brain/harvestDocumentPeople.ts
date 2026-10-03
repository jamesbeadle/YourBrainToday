import { peopleHarvestPrompt, peopleHarvestTool } from './peopleHarvestPrompt';
import { parseHarvest } from '$lib/server/agent/parseHarvest';
import { requestToolCall } from '$lib/server/anthropic/requestToolCall';
import type { HumanNetwork } from '$lib/server/knowledge/humanWriter';

const maxHarvestTokens = 6000;

export async function harvestDocumentPeople(
	contentBlock: unknown,
	filename: string,
	brainName: string,
	knownPeople: string[]
): Promise<HumanNetwork> {
	const harvest = await requestToolCall(
		{
			system: peopleHarvestPrompt(brainName, knownPeople),
			messages: [{ role: 'user', content: [instructionBlock(filename), contentBlock] }],
			tools: [peopleHarvestTool],
			maxTokens: maxHarvestTokens
		},
		peopleHarvestTool.name
	);
	const { people, connections } = parseHarvest(harvest as Record<string, unknown>);
	return { people, connections };
}

function instructionBlock(filename: string) {
	return {
		type: 'text',
		text: `Harvest the people and relationships in this source document. Its filename is "${filename}".`
	};
}
