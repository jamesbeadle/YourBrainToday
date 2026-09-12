import { modellerIngestPrompt } from './modellerIngestPrompt';
import { parseIngestRecord } from './parseIngestRecord';
import { renderDomainModelIndex } from './getBrainPageIndex';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { toolUseFrom } from '$lib/server/anthropic/anthropicTypes';
import { updateModelTool } from './updateModelTool';
import type { BrainContext, BrainPageSummary } from '$lib/data/brainTypes';
import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
import type { IngestRecord } from './parseIngestRecord';

const maxIngestTokens = 24_000;

export async function ingestSource(
	contentBlock: unknown,
	filename: string,
	brain: DomainBrain,
	contexts: BrainContext[],
	index: BrainPageSummary[]
): Promise<IngestRecord> {
	const response = await requestAnthropic({
		system: systemPromptFor(brain, contexts, index),
		messages: [{ role: 'user', content: [instructionBlock(filename), contentBlock] }],
		tools: [updateModelTool],
		forcedToolName: updateModelTool.name,
		maxTokens: maxIngestTokens
	});
	if (response.stop_reason === 'max_tokens') {
		throw new Error('Ingest ran out of room before finishing the model update');
	}
	const record = parseIngestRecord(toolUseFrom(response, updateModelTool.name));
	if (record === null) throw new Error('Ingest produced no usable model update');
	return record;
}

function systemPromptFor(
	brain: DomainBrain,
	contexts: BrainContext[],
	index: BrainPageSummary[]
): string {
	const prompt = modellerIngestPrompt(brain.name, brain.domainGoal);
	return `${prompt}\n\n## Current model index\n\n${renderDomainModelIndex(contexts, index)}`;
}

function instructionBlock(filename: string) {
	return {
		type: 'text',
		text: `Ingest this source document into the domain model. Its filename is "${filename}".`
	};
}
