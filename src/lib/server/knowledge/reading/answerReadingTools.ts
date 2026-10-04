import { readExpertisePages } from './readExpertisePages';
import { searchKnowledgeTool, searchReading } from './searchKnowledgeTool';
import { queryFrom } from '$lib/server/search/queryFrom';
import { readPagesTool } from '$lib/server/brain/modellerAnswerTools';
import type { AnthropicMessage, AnthropicToolUseBlock } from '$lib/server/anthropic/anthropicTypes';
import type { KnowledgeBaseReading } from './readKnowledgeBase';
import type { SupabaseClient } from '@supabase/supabase-js';

export const readingToolNames = [searchKnowledgeTool.name, readPagesTool.name];

export type ToolsAnswered = { message: AnthropicMessage; keysRead: string[] };

// Every reading tool the model called in one round, answered in one user
// message so the model keeps calling tools in parallel; the pages that came
// back are reported so the exchange can say what was truly read.
export async function answerReadingTools(
	supabase: SupabaseClient,
	reading: KnowledgeBaseReading,
	toolCalls: AnthropicToolUseBlock[]
): Promise<ToolsAnswered> {
	const resultBlocks: unknown[] = [];
	const keysRead: string[] = [];
	for (const toolCall of toolCalls) {
		if (toolCall.name === readPagesTool.name) {
			const pagesRead = await readExpertisePages(supabase, reading.expertise, toolCall);
			resultBlocks.push(pagesRead.resultBlock);
			keysRead.push(...pagesRead.keysRead);
			continue;
		}
		resultBlocks.push(await searchResultBlock(supabase, reading, toolCall));
	}
	return { message: { role: 'user', content: resultBlocks }, keysRead };
}

async function searchResultBlock(
	supabase: SupabaseClient,
	reading: KnowledgeBaseReading,
	toolCall: AnthropicToolUseBlock
): Promise<unknown> {
	const content = await searchReading(supabase, reading, queryFrom(toolCall.input));
	return { type: 'tool_result', tool_use_id: toolCall.id, content };
}
