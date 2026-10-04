import { beforeEach, describe, expect, it, vi } from 'vitest';
import { askModeller } from './askModeller';
import { mostReadingRounds } from '$lib/server/knowledge/reading/readingTypes';
import type { AnthropicRequest } from '$lib/server/anthropic/requestAnthropic';
import type { SupabaseClient } from '@supabase/supabase-js';

const requestAnthropic = vi.hoisted(() => vi.fn());
const getBrainPagesBySlugs = vi.hoisted(() => vi.fn());
const searchBrainPages = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/anthropic/requestAnthropic', () => ({ requestAnthropic }));
vi.mock('./getBrainPage', () => ({ getBrainPagesBySlugs }));
vi.mock('$lib/server/search/searchBrainPages', () => ({ searchBrainPages }));

const supabase = {} as SupabaseClient;
const turns = [{ speaker: 'user' as const, text: 'Who signs the valuation?' }];
const signOffPage = {
	slug: 'sign-off',
	title: 'Sign-off',
	summary: 'Who signs',
	kind: 'domain_service' as const,
	contextSlug: 'ops',
	body: 'The [Site Manager](/domain-brain/site-manager) signs every [Valuation](/domain-brain/valuation).',
	updatedAt: ''
};

const readCall = (id: string) => ({ type: 'tool_use', id, name: 'read_pages', input: { slugs: ['sign-off'] } });
const searchCall = (id: string) => ({ type: 'tool_use', id, name: 'search_pages', input: { query: 'signs' } });
const answerInput = { answerMarkdown: 'The site manager.', citedSlugs: ['sign-off'] };
const answerCall = { type: 'tool_use', id: 'answer-1', name: 'answer', input: answerInput };
const replyWith = (...content: unknown[]) => ({ content, stop_reason: 'tool_use', model: 'stub' });

const ask = () => askModeller(supabase, 'brain-1', [], [], turns);
const requestNumber = (index: number): AnthropicRequest => {
	const { mock } = requestAnthropic;
	return mock.calls[index][0] as AnthropicRequest;
};
const toolResultsOf = (request: AnthropicRequest) =>
	request.messages[2].content as { tool_use_id: string; content: string }[];

beforeEach(() => {
	requestAnthropic.mockReset();
	getBrainPagesBySlugs.mockReset();
	searchBrainPages.mockReset();
	getBrainPagesBySlugs.mockResolvedValue([signOffPage]);
	searchBrainPages.mockResolvedValue([
		{ slug: 'sign-off', kind: 'domain_service', title: 'Sign-off', snippet: 'signs every valuation', rank: 1 }
	]);
});

describe('askModeller', () => {
	it('answers at once when the model does, offering search, read and answer', async () => {
		requestAnthropic.mockResolvedValueOnce(replyWith(answerCall));
		const answer = await ask();
		expect(answer).toEqual(answerInput);
		const request = requestNumber(0);
		expect(request.tools.map((tool) => tool.name)).toEqual(['search_pages', 'read_pages', 'answer']);
		expect(request.mustUseTool).toBe(true);
	});

	it('answers a search and a read of one round in one message, in order', async () => {
		requestAnthropic
			.mockResolvedValueOnce(replyWith(searchCall('s1'), readCall('r1')))
			.mockResolvedValueOnce(replyWith(answerCall));
		await ask();
		const toolResults = toolResultsOf(requestNumber(1));
		expect(toolResults.map((block) => block.tool_use_id)).toEqual(['s1', 'r1']);
		expect(toolResults[0].content).toContain('- sign-off [Domain service] — Sign-off: signs every valuation');
	});

	it('lists the pages a page links to beneath its body', async () => {
		requestAnthropic
			.mockResolvedValueOnce(replyWith(readCall('r1')))
			.mockResolvedValueOnce(replyWith(answerCall));
		await ask();
		const [pagesRead] = toolResultsOf(requestNumber(1));
		expect(pagesRead.content).toContain('# Sign-off (sign-off)');
		expect(pagesRead.content).toContain('Links to: site-manager, valuation');
	});

	it('forces the answer after the last reading round', async () => {
		let roundNumber = 0;
		requestAnthropic.mockImplementation(async (request: AnthropicRequest) =>
			request.forcedToolName === 'answer' ? replyWith(answerCall) : replyWith(readCall(`r${(roundNumber += 1)}`))
		);
		const answer = await ask();
		expect(requestAnthropic).toHaveBeenCalledTimes(mostReadingRounds + 1);
		expect(answer.citedSlugs).toEqual(['sign-off']);
	});

	it('falls back to the apology when the model calls no tool at all', async () => {
		requestAnthropic.mockResolvedValueOnce(replyWith({ type: 'text', text: 'prose' }));
		const answer = await ask();
		expect(answer.citedSlugs).toEqual([]);
		expect(answer.answerMarkdown).toContain('could not put an answer together');
	});
});
