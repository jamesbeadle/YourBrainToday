import { modellerUnlearnPrompt } from './modellerUnlearnPrompt';
import { parseRetirementRecord } from './parseRetirementRecord';
import { renderDomainModelIndex } from './getBrainPageIndex';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { retireSourceTool } from './retireSourceTool';
import { toolUseFrom } from '$lib/server/anthropic/anthropicTypes';
import type { BrainContext, BrainPage, BrainPageSummary } from '$lib/data/brainTypes';
import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
import type { RetirementRecord } from './parseRetirementRecord';

const maxUnlearnTokens = 24_000;

export async function unlearnSource(
	contentBlock: unknown,
	filename: string,
	brain: DomainBrain,
	contexts: BrainContext[],
	index: BrainPageSummary[],
	touchedPages: BrainPage[]
): Promise<RetirementRecord> {
	const response = await requestAnthropic({
		system: systemPromptFor(brain, contexts, index, touchedPages),
		messages: [{ role: 'user', content: [instructionBlock(filename), contentBlock] }],
		tools: [retireSourceTool],
		forcedToolName: retireSourceTool.name,
		maxTokens: maxUnlearnTokens
	});
	if (response.stop_reason === 'max_tokens') {
		throw new Error('Unlearning ran out of room before finishing the model update');
	}
	const record = parseRetirementRecord(toolUseFrom(response, retireSourceTool.name));
	if (record === null) throw new Error('Unlearning produced no usable model update');
	return record;
}

function systemPromptFor(
	brain: DomainBrain,
	contexts: BrainContext[],
	index: BrainPageSummary[],
	touchedPages: BrainPage[]
): string {
	return [
		modellerUnlearnPrompt(brain.name, brain.domainGoal),
		`## Current model index\n\n${renderDomainModelIndex(contexts, index)}`,
		`## Pages this source created or updated\n\n${renderTouchedPages(touchedPages)}`
	].join('\n\n');
}

function renderTouchedPages(touchedPages: BrainPage[]): string {
	if (touchedPages.length === 0) return '(none recorded)';
	return touchedPages.map((page) => `### ${page.slug}\n\n${page.body}`).join('\n\n');
}

function instructionBlock(filename: string) {
	return {
		type: 'text',
		text: `This source document is being retired from the model. Its filename is "${filename}".`
	};
}
