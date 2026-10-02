import type {
	AnthropicMessage,
	AnthropicTool,
	AnthropicToolUseBlock
} from '$lib/server/anthropic/anthropicTypes';

export type ReadingExchange = {
	system: string;
	messages: AnthropicMessage[];
	answerTool: AnthropicTool;
	model?: string;
};

export type ReadingOutcome = {
	answerCall: AnthropicToolUseBlock | undefined;
	pagesRead: string[];
};

// How many rounds of searching and reading the model gets before the answer
// tool is forced; a round may hold several tool calls, each answered in turn.
export const mostReadingRounds = 3;
