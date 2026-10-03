import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runReadingExchange } from './readingExchange';
import { mostReadingRounds } from './readingTypes';
import type { AnthropicRequest } from '$lib/server/anthropic/requestAnthropic';
import type { KnowledgeBaseReading } from './readKnowledgeBase';
import type { SupabaseClient } from '@supabase/supabase-js';

const requestAnthropic = vi.hoisted(() => vi.fn());
const readExpertisePages = vi.hoisted(() => vi.fn());
const searchReading = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/anthropic/requestAnthropic', () => ({ requestAnthropic }));
vi.mock('./readExpertisePages', () => ({ readExpertisePages }));
vi.mock('./searchKnowledgeTool', async (importActual) => ({
	...(await importActual<typeof import('./searchKnowledgeTool')>()),
	searchReading
}));

const answerTool = { name: 'answer', description: '', input_schema: {} };
const exchange = { system: 'Answer.', messages: [{ role: 'user' as const, content: 'Who signs?' }], answerTool };
const reading = { knowledgeBaseId: 'kb', expertise: [] } as unknown as KnowledgeBaseReading;
const supabase = {} as SupabaseClient;

const readCall = (id: string) => ({ type: 'tool_use', id, name: 'read_pages', input: { slugs: ['ops/sign-off'] } });
const searchCall = (id: string) => ({ type: 'tool_use', id, name: 'search_knowledge', input: { query: 'sign' } });
const answerCall = { type: 'tool_use', id: 'answer-1', name: 'answer', input: { answerMarkdown: 'The site manager.' } };

const replyWith = (...content: unknown[]) => ({ content, stop_reason: 'tool_use', model: 'stub' });

beforeEach(() => {
	requestAnthropic.mockReset();
	readExpertisePages.mockReset();
	searchReading.mockReset();
	readExpertisePages.mockImplementation(async (_supabase, _brains, request) => ({
		resultBlock: { type: 'tool_result', tool_use_id: request.id, content: 'page body' },
		keysRead: ['ops/sign-off']
	}));
	searchReading.mockResolvedValue('- page ops/sign-off — Sign-off: who signs');
});

describe('runReadingExchange', () => {
	it('answers at once when the model does, having read nothing', async () => {
		requestAnthropic.mockResolvedValueOnce(replyWith(answerCall));
		const outcome = await runReadingExchange(supabase, reading, exchange, [answerTool]);
		expect(outcome.answerCall?.input).toEqual({ answerMarkdown: 'The site manager.' });
		expect(outcome.pagesRead).toEqual([]);
		expect(requestAnthropic).toHaveBeenCalledTimes(1);
	});

	it('answers every tool call of a round in one message and records the pages read', async () => {
		requestAnthropic
			.mockResolvedValueOnce(replyWith(searchCall('s1'), readCall('r1')))
			.mockResolvedValueOnce(replyWith(answerCall));
		const outcome = await runReadingExchange(supabase, reading, exchange, [answerTool]);
		expect(outcome.pagesRead).toEqual(['ops/sign-off']);
		const secondRequest = requestAnthropic.mock.calls[1][0] as AnthropicRequest;
		const toolResults = secondRequest.messages[2].content as { tool_use_id: string }[];
		expect(toolResults.map((block) => block.tool_use_id)).toEqual(['s1', 'r1']);
		expect(secondRequest.mustUseTool).toBe(true);
	});

	it('forces the answer after the last reading round', async () => {
		requestAnthropic.mockImplementation(async (request: AnthropicRequest) =>
			request.forcedToolName === 'answer' ? replyWith(answerCall) : replyWith(readCall(`r${request.messages.length}`))
		);
		const outcome = await runReadingExchange(supabase, reading, exchange, [answerTool]);
		expect(requestAnthropic).toHaveBeenCalledTimes(mostReadingRounds + 1);
		expect(outcome.answerCall).toBeDefined();
		expect(outcome.pagesRead).toEqual(['ops/sign-off']);
	});

	it('reports no answer when the model calls no tool at all', async () => {
		requestAnthropic.mockResolvedValueOnce(replyWith({ type: 'text', text: 'prose' }));
		const outcome = await runReadingExchange(supabase, reading, exchange, [answerTool]);
		expect(outcome.answerCall).toBeUndefined();
	});
});
