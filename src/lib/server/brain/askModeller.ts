import { answerModellerTools, modellerReadingCallsIn } from './answerModellerTools';
import { answerTool, readPagesTool } from './modellerAnswerTools';
import { modellerQueryPrompt } from './modellerQueryPrompt';
import { parseBrainAnswer } from './parseBrainAnswer';
import { toolUseNamed } from './readPagesExchange';
import { renderDomainModelIndex } from './getBrainPageIndex';
import { searchPagesTool } from './searchPagesTool';
import { mostReadingRounds } from '$lib/server/knowledge/reading/readingTypes';
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
const tools = [searchPagesTool, readPagesTool, answerTool];

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
	for (let round = 0; round <= mostReadingRounds; round += 1) {
		const isFinalRound = round === mostReadingRounds;
		const response = await requestAnthropic({
			system,
			messages,
			tools,
			maxTokens: maxAnswerTokens,
			model,
			...(isFinalRound ? { forcedToolName: answerTool.name } : { mustUseTool: true })
		});
		const answerCall = toolUseNamed(response.content, answerTool.name);
		if (answerCall !== undefined) return parseBrainAnswer(answerCall.input);
		const readingCalls = modellerReadingCallsIn(response.content);
		if (readingCalls.length === 0) return parseBrainAnswer(undefined);
		messages.push({ role: 'assistant', content: response.content });
		messages.push(await answerModellerTools(supabase, brainId, readingCalls));
	}
	return parseBrainAnswer(undefined);
}

function messagesFromTurns(turns: BrainConversationTurn[]): AnthropicMessage[] {
	const firstUserIndex = turns.findIndex((turn) => turn.speaker === 'user');
	if (firstUserIndex < 0) return [];
	return turns.slice(firstUserIndex).map((turn) => ({
		role: turn.speaker === 'user' ? 'user' : 'assistant',
		content: turn.text
	}));
}
