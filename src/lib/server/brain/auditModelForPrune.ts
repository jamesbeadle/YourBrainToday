import { renderDomainModelIndex } from './getBrainPageIndex';
import { modellerPrunePrompt } from './modellerPrunePrompt';
import { parsePruneRecord } from './parsePruneRecord';
import { pruneModelTool } from './pruneModelTool';
import { readPagesResultMessage, toolUseNamed, toolUsesNamed } from './readPagesExchange';
import { readPagesTool } from './modellerAnswerTools';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import type { AnthropicMessage } from '$lib/server/anthropic/anthropicTypes';
import type { BrainContext, BrainPageSummary } from '$lib/data/brainTypes';
import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
import type { PruneRecord } from './parsePruneRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

const maxPruneTokens = 24_000;
const maxReadRounds = 3;
const tools = [readPagesTool, pruneModelTool];

export async function auditModelForPrune(
	supabase: SupabaseClient,
	brain: DomainBrain,
	contexts: BrainContext[],
	index: BrainPageSummary[]
): Promise<PruneRecord> {
	const system = `${modellerPrunePrompt(brain.name, brain.domainGoal)}\n\n## Model index\n\n${renderDomainModelIndex(contexts, index)}`;
	const messages: AnthropicMessage[] = [
		{ role: 'user', content: 'Prune the model now. Read any pages you need first.' }
	];
	for (let round = 0; round < maxReadRounds; round += 1) {
		const response = await requestAnthropic({ system, messages, tools, maxTokens: maxPruneTokens });
		const record = parsePruneRecord(toolUseNamed(response.content, pruneModelTool.name)?.input);
		if (record !== null) return record;
		const readRequests = toolUsesNamed(response.content, readPagesTool.name);
		if (readRequests.length === 0) break;
		messages.push({ role: 'assistant', content: response.content });
		messages.push(await readPagesResultMessage(supabase, brain.id, readRequests));
	}
	return forcePruneRecord(system, messages);
}

async function forcePruneRecord(
	system: string,
	messages: AnthropicMessage[]
): Promise<PruneRecord> {
	const finalResponse = await requestAnthropic({
		system,
		messages,
		tools,
		forcedToolName: pruneModelTool.name,
		maxTokens: maxPruneTokens
	});
	if (finalResponse.stop_reason === 'max_tokens') {
		throw new Error('Pruning ran out of room before finishing the model update');
	}
	const record = parsePruneRecord(toolUseNamed(finalResponse.content, pruneModelTool.name)?.input);
	if (record === null) throw new Error('Pruning produced no usable model update');
	return record;
}
