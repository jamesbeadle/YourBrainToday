import { readExpertisePages } from './readExpertisePages';
import { readPagesTool } from '$lib/server/brain/modellerAnswerTools';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { toolUseNamed, toolUsesNamed } from '$lib/server/brain/readPagesExchange';
import type {
	AnthropicMessage,
	AnthropicTool,
	AnthropicToolUseBlock
} from '$lib/server/anthropic/anthropicTypes';
import type { KnowledgeBaseReading } from './readKnowledgeBase';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ReadingExchange = {
	system: string;
	messages: AnthropicMessage[];
	answerTool: AnthropicTool;
	model?: string;
};

const maxAnswerTokens = 4000;
const replyLogLimit = 600;

// One round of reading, then the answer. The model must reply through a
// tool: read_pages for the expertise pages it needs, or the answer tool at
// once when the brains already in front of it answer. After the pages come
// back the answer tool is forced, so the exchange always ends in an answer.
export async function readThenAnswer(
	supabase: SupabaseClient,
	reading: KnowledgeBaseReading,
	exchange: ReadingExchange
): Promise<AnthropicToolUseBlock | undefined> {
	const tools = [readPagesTool, exchange.answerTool];
	const messages = [...exchange.messages];
	const firstResponse = await requestAnthropic({
		system: exchange.system,
		messages,
		tools,
		mustUseTool: true,
		maxTokens: maxAnswerTokens,
		model: exchange.model
	});
	const immediateAnswer = toolUseNamed(firstResponse.content, exchange.answerTool.name);
	if (immediateAnswer !== undefined) return immediateAnswer;
	const readRequests = toolUsesNamed(firstResponse.content, readPagesTool.name);
	if (readRequests.length === 0) return noAnswerIn(firstResponse.content);
	messages.push({ role: 'assistant', content: firstResponse.content });
	messages.push(await readExpertisePages(supabase, reading.expertise, readRequests));
	const secondResponse = await requestAnthropic({
		system: exchange.system,
		messages,
		tools,
		forcedToolName: exchange.answerTool.name,
		maxTokens: maxAnswerTokens,
		model: exchange.model
	});
	return toolUseNamed(secondResponse.content, exchange.answerTool.name) ?? noAnswerIn(secondResponse.content);
}

function noAnswerIn(content: unknown[]): undefined {
	console.error('The reply held no answer tool call', JSON.stringify(content).slice(0, replyLogLimit));
	return undefined;
}
