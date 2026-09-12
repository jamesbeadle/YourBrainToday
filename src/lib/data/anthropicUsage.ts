export type AnthropicUsage = {
	inputTokens: number;
	outputTokens: number;
	cacheReadTokens: number;
	cacheWriteTokens: number;
};

export type MeteredCall = { modelId: string; usage: AnthropicUsage };

export const emptyUsage: AnthropicUsage = {
	inputTokens: 0,
	outputTokens: 0,
	cacheReadTokens: 0,
	cacheWriteTokens: 0
};
