import { readPagesTool } from './modellerAnswerTools';
import { readPagesResultMessage } from './readPagesExchange';
import { searchPagesResultBlock, searchPagesTool } from './searchPagesTool';
import type { AnthropicMessage, AnthropicToolUseBlock } from '$lib/server/anthropic/anthropicTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const modellerReadingToolNames = [searchPagesTool.name, readPagesTool.name];

export function modellerReadingCallsIn(content: unknown[]): AnthropicToolUseBlock[] {
	return content.filter(
		(block): block is AnthropicToolUseBlock =>
			(block as AnthropicToolUseBlock).type === 'tool_use' &&
			modellerReadingToolNames.includes((block as AnthropicToolUseBlock).name)
	);
}

export async function answerModellerTools(
	supabase: SupabaseClient,
	brainId: string,
	toolCalls: AnthropicToolUseBlock[]
): Promise<AnthropicMessage> {
	const resultBlocks: unknown[] = [];
	for (const toolCall of toolCalls) {
		resultBlocks.push(await resultBlockFor(supabase, brainId, toolCall));
	}
	return { role: 'user', content: resultBlocks };
}

async function resultBlockFor(
	supabase: SupabaseClient,
	brainId: string,
	toolCall: AnthropicToolUseBlock
): Promise<unknown> {
	if (toolCall.name === searchPagesTool.name) {
		return searchPagesResultBlock(supabase, brainId, toolCall);
	}
	const readMessage = await readPagesResultMessage(supabase, brainId, [toolCall]);
	return (readMessage.content as unknown[])[0];
}
