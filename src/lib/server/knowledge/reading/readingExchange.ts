import { answerReadingTools, readingToolNames } from './answerReadingTools';
import { mostReadingRounds, type ReadingExchange, type ReadingOutcome } from './readingTypes';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { toolUseNamed } from '$lib/server/brain/readPagesExchange';
import type {
	AnthropicRequestTool,
	AnthropicToolUseBlock
} from '$lib/server/anthropic/anthropicTypes';
import type { KnowledgeBaseReading } from './readKnowledgeBase';
import type { SupabaseClient } from '@supabase/supabase-js';

const maxAnswerTokens = 4000;
const replyLogLimit = 600;

// The model must reply through a tool each round: search_knowledge or
// read_pages to pull more, or the answer tool when it has enough. After the
// last reading round the answer tool is forced, so the exchange always ends
// in an answer or an honest absence of one.
export async function runReadingExchange(
	supabase: SupabaseClient,
	reading: KnowledgeBaseReading,
	exchange: ReadingExchange,
	tools: AnthropicRequestTool[]
): Promise<ReadingOutcome> {
	const messages = [...exchange.messages];
	const pagesRead = new Set<string>();
	for (let round = 0; round <= mostReadingRounds; round += 1) {
		const isFinalRound = round === mostReadingRounds;
		const response = await requestAnthropic({
			system: exchange.system,
			messages,
			tools,
			maxTokens: maxAnswerTokens,
			model: exchange.model,
			...(isFinalRound ? { forcedToolName: exchange.answerTool.name } : { mustUseTool: true })
		});
		const answerCall = toolUseNamed(response.content, exchange.answerTool.name);
		if (answerCall !== undefined) return { answerCall, pagesRead: [...pagesRead] };
		const toolCalls = readingToolCallsIn(response.content);
		if (toolCalls.length === 0) return { answerCall: noAnswerIn(response.content), pagesRead: [...pagesRead] };
		messages.push({ role: 'assistant', content: response.content });
		const answered = await answerReadingTools(supabase, reading, toolCalls);
		answered.keysRead.forEach((key) => pagesRead.add(key));
		messages.push(answered.message);
	}
	return { answerCall: undefined, pagesRead: [...pagesRead] };
}

function readingToolCallsIn(content: unknown[]): AnthropicToolUseBlock[] {
	return content.filter(
		(block): block is AnthropicToolUseBlock =>
			(block as AnthropicToolUseBlock).type === 'tool_use' &&
			readingToolNames.includes((block as AnthropicToolUseBlock).name)
	);
}

function noAnswerIn(content: unknown[]): undefined {
	console.error('The reply held no answer tool call', JSON.stringify(content).slice(0, replyLogLimit));
	return undefined;
}
