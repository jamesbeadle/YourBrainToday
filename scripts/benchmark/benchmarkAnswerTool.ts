import { parseBrainAnswer } from '$lib/server/brain/parseBrainAnswer';
import type { AnthropicTool } from '$lib/server/anthropic/anthropicTypes';

export const benchmarkAnswerTool: AnthropicTool = {
	name: 'answer',
	description: 'Deliver the final answer and name the sources you drew on.',
	input_schema: {
		type: 'object',
		required: ['answerMarkdown', 'citedSources'],
		properties: {
			answerMarkdown: { type: 'string', description: 'The answer, in markdown' },
			citedSources: {
				type: 'array',
				items: { type: 'string' },
				description: 'The filenames or page keys the answer drew on'
			}
		}
	}
};

export const maxBenchmarkAnswerTokens = 4000;

export const fallbackAnswerText = parseBrainAnswer(undefined).answerMarkdown;

export function parseBenchmarkAnswer(input: unknown): { answerMarkdown: string; citedSources: string[] } {
	const answerMarkdown = parseBrainAnswer(input).answerMarkdown;
	if (typeof input !== 'object' || input === null) return { answerMarkdown, citedSources: [] };
	const candidate = (input as { citedSources?: unknown }).citedSources;
	const citedSources = Array.isArray(candidate)
		? candidate.filter((source): source is string => typeof source === 'string')
		: [];
	return { answerMarkdown, citedSources };
}

export function isFallbackAnswer(answerMarkdown: string): boolean {
	return answerMarkdown === fallbackAnswerText;
}
