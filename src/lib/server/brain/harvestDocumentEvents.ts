import { documentHarvestPrompt, documentHarvestTool } from './documentHarvestPrompt';
import { parseHarvest, type HarvestedEvent } from '$lib/server/agent/parseHarvest';
import { requestToolCall } from '$lib/server/anthropic/requestToolCall';

const maxHarvestTokens = 8000;

export async function harvestDocumentEvents(
	contentBlock: unknown,
	filename: string,
	brainName: string,
	knownTerms: string[]
): Promise<HarvestedEvent[]> {
	const harvest = await requestToolCall(
		{
			system: documentHarvestPrompt(brainName, knownTerms),
			messages: [{ role: 'user', content: [instructionBlock(filename), contentBlock] }],
			tools: [documentHarvestTool],
			maxTokens: maxHarvestTokens
		},
		documentHarvestTool.name
	);
	return parseHarvest(harvest as Record<string, unknown>).experienceEvents;
}

function instructionBlock(filename: string) {
	return {
		type: 'text',
		text: `Harvest the experience in this source document. Its filename is "${filename}".`
	};
}
