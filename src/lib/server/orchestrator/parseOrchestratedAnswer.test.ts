import { describe, expect, it } from 'vitest';
import { parseOrchestratedAnswer } from './parseOrchestratedAnswer';

const everyKind = ['expertise', 'experience', 'process', 'human'] as const;

describe('parseOrchestratedAnswer', () => {
	it('keeps the answer, the page keys and the brains it drew on', () => {
		const answer = parseOrchestratedAnswer(
			{
				answerMarkdown: 'The site manager signs it off.',
				citedSlugs: ['ops-1a2b/sign-off'],
				brainsConsulted: ['process', 'expertise']
			},
			[...everyKind]
		);
		expect(answer.answerMarkdown).toBe('The site manager signs it off.');
		expect(answer.citedPageKeys).toEqual(['ops-1a2b/sign-off']);
		expect(answer.brainsConsulted).toEqual(['expertise', 'process']);
	});

	it('drops brains that were not asked and names it does not know', () => {
		const answer = parseOrchestratedAnswer(
			{ answerMarkdown: 'Ask Priya.', citedSlugs: [], brainsConsulted: ['human', 'expertise', 'weather'] },
			['human']
		);
		expect(answer.brainsConsulted).toEqual(['human']);
	});

	it('keeps only citations the exchange read or the index names, and reports the pages read', () => {
		const answer = parseOrchestratedAnswer(
			{ answerMarkdown: 'Priya.', citedSlugs: ['ops/read', 'ops/indexed', 'ops/invented'], brainsConsulted: ['expertise'] },
			[...everyKind],
			{ pagesRead: ['ops/read'], indexedKeys: ['ops/indexed'] }
		);
		expect(answer.citedPageKeys).toEqual(['ops/read', 'ops/indexed']);
		expect(answer.pagesRead).toEqual(['ops/read']);
	});

	it('falls back to a plain apology when the reply held no answer', () => {
		const answer = parseOrchestratedAnswer(undefined, [...everyKind]);
		expect(answer.answerMarkdown).toContain('could not put an answer together');
		expect(answer.citedPageKeys).toEqual([]);
		expect(answer.brainsConsulted).toEqual([]);
	});
});
