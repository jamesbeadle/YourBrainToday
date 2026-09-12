import { documentHarvestPrompt, documentHarvestTool } from './documentHarvestPrompt';
import { parseHarvest, type HarvestedEvent } from '$lib/server/agent/parseHarvest';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { toolUseFrom } from '$lib/server/anthropic/anthropicTypes';

const maxHarvestTokens = 8000;

export async function harvestDocumentEvents(
	contentBlock: unknown,
	filename: string,
	brainName: string,
	knownTerms: string[]
): Promise<HarvestedEvent[]> {
	const response = await requestAnthropic({
		system: documentHarvestPrompt(brainName, knownTerms),
		messages: [{ role: 'user', content: [instructionBlock(filename), contentBlock] }],
		tools: [documentHarvestTool],
		forcedToolName: documentHarvestTool.name,
		maxTokens: maxHarvestTokens
	});
	const harvest = toolUseFrom(response, documentHarvestTool.name);
	if (harvest === undefined) throw new Error('The document harvest produced no result');
	return parseHarvest(harvest as Record<string, unknown>).experienceEvents;
}

function instructionBlock(filename: string) {
	return {
		type: 'text',
		text: `Harvest the experience in this source document. Its filename is "${filename}".`
	};
}
