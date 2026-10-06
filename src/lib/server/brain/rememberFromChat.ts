import { modellerRememberPrompt } from './modellerRememberPrompt';
import { parseRememberRecord, type RememberRecord } from './parseRememberRecord';
import { readPagesTool } from './modellerAnswerTools';
import { readPagesResultMessage, toolUseNamed, toolUsesNamed } from './readPagesExchange';
import { rememberModelTool } from './rememberModelTool';
import { renderDomainModelIndex } from './getBrainPageIndex';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import type { AnthropicMessage, AnthropicResponse } from '$lib/server/anthropic/anthropicTypes';
import type { BrainContext, BrainPageSummary } from '$lib/data/brainModelTypes';
import type { BrainConversationTurn } from '$lib/data/brainConversationTypes';
import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
import type { SupabaseClient } from '@supabase/supabase-js';

const maxRememberTokens = 8000;

const tools = [readPagesTool, rememberModelTool];

type RememberExchange = {
	supabase: SupabaseClient;
	brainId: string;
	system: string;
	messages: AnthropicMessage[];
	model?: string;
};

export async function rememberFromChat(
	supabase: SupabaseClient,
	brain: DomainBrain,
	contexts: BrainContext[],
	index: BrainPageSummary[],
	turns: BrainConversationTurn[],
	model?: string
): Promise<RememberRecord> {
	const system = `${modellerRememberPrompt(brain.name, brain.domainGoal)}\n\n## Model index\n\n${renderDomainModelIndex(contexts, index)}`;
	const exchange = { supabase, brainId: brain.id, system, messages: messagesFromTurns(turns), model };
	const firstResponse = await requestAnthropic({
		system,
		messages: exchange.messages,
		tools,
		mustUseTool: true,
		maxTokens: maxRememberTokens,
		model
	});
	const immediateRecord = toolUseNamed(firstResponse.content, rememberModelTool.name);
	if (immediateRecord !== undefined) return parseRememberRecord(immediateRecord.input);
	return readThenRemember(exchange, firstResponse);
}

async function readThenRemember(
	exchange: RememberExchange,
	firstResponse: AnthropicResponse
): Promise<RememberRecord> {
	const readRequests = toolUsesNamed(firstResponse.content, readPagesTool.name);
	if (readRequests.length === 0) return parseRememberRecord(undefined);
	const { supabase, brainId, system, messages, model } = exchange;
	messages.push({ role: 'assistant', content: firstResponse.content });
	messages.push(await readPagesResultMessage(supabase, brainId, readRequests));
	const secondResponse = await requestAnthropic({
		system,
		messages,
		tools,
		forcedToolName: rememberModelTool.name,
		maxTokens: maxRememberTokens,
		model
	});
	return parseRememberRecord(toolUseNamed(secondResponse.content, rememberModelTool.name)?.input);
}

function messagesFromTurns(turns: BrainConversationTurn[]): AnthropicMessage[] {
	const firstUserIndex = turns.findIndex((turn) => turn.speaker === 'user');
	return turns.slice(firstUserIndex).map((turn) => ({
		role: turn.speaker === 'user' ? 'user' : 'assistant',
		content: turn.text
	}));
}
