import { answerTool, readPagesTool } from './modellerAnswerTools';
import { modellerQueryPrompt } from './modellerQueryPrompt';
import { parseBrainAnswer } from './parseBrainAnswer';
import { readPagesResultMessage, toolUseNamed, toolUsesNamed } from './readPagesExchange';
import { renderDomainModelIndex } from './getBrainPageIndex';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import type { AnthropicMessage } from '$lib/server/anthropic/anthropicTypes';
import type {
	BrainAnswer,
	BrainContext,
	BrainConversationTurn,
	BrainPageSummary
} from '$lib/data/brainTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const maxAnswerTokens = 4000;

export async function askModeller(
	supabase: SupabaseClient,
	brainId: string,
	contexts: BrainContext[],
	index: BrainPageSummary[],
	turns: BrainConversationTurn[],
	// Pins the model for callers with no session to resolve one (the bearer
	// API), so a dear site model never runs at a fixed cheap price.
	model?: string
): Promise<BrainAnswer> {
	const system = `${modellerQueryPrompt}\n\n## Model index\n\n${renderDomainModelIndex(contexts, index)}`;
	const messages = messagesFromTurns(turns);
	const firstResponse = await requestAnthropic({
		system,
		messages,
		tools: [readPagesTool, answerTool],
		maxTokens: maxAnswerTokens,
		model
	});
	const hasImmediateAnswer = toolUseNamed(firstResponse.content, answerTool.name) !== undefined;
	const readRequests = hasImmediateAnswer
		? []
		: toolUsesNamed(firstResponse.content, readPagesTool.name);
	if (readRequests.length === 0) {
		return parseBrainAnswer(toolUseNamed(firstResponse.content, answerTool.name)?.input);
	}
	messages.push({ role: 'assistant', content: firstResponse.content });
	messages.push(await readPagesResultMessage(supabase, brainId, readRequests));
	const secondResponse = await requestAnthropic({
		system,
		messages,
		tools: [readPagesTool, answerTool],
		forcedToolName: answerTool.name,
		maxTokens: maxAnswerTokens,
		model
	});
	return parseBrainAnswer(toolUseNamed(secondResponse.content, answerTool.name)?.input);
}

function messagesFromTurns(turns: BrainConversationTurn[]): AnthropicMessage[] {
	const firstUserIndex = turns.findIndex((turn) => turn.speaker === 'user');
	if (firstUserIndex < 0) return [];
	return turns.slice(firstUserIndex).map((turn) => ({
		role: turn.speaker === 'user' ? 'user' : 'assistant',
		content: turn.text
	}));
}
