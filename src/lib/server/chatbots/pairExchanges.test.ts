import { describe, expect, it } from 'vitest';
import { pairExchanges, type LoggedMessage } from './pairExchanges';

const message = (overrides: Partial<LoggedMessage>): LoggedMessage => ({
	id: 'm',
	conversationId: 'c1',
	memberId: 'u1',
	speaker: 'member',
	body: '',
	citedPageKeys: [],
	createdAt: '2026-09-28T10:00:00+00:00',
	...overrides
});

describe('pairExchanges', () => {
	it('pairs a question with the answer written at the same moment, newest first', () => {
		const exchanges = pairExchanges([
			message({ id: 'a2', speaker: 'bot', body: 'Yes.', createdAt: '2026-09-28T11:00:00+00:00' }),
			message({ id: 'q2', body: 'Later?', createdAt: '2026-09-28T11:00:00+00:00' }),
			message({ id: 'a1', speaker: 'bot', body: 'The site manager.', citedPageKeys: ['ops/sign-off'] }),
			message({ id: 'q1', body: 'Who signs off?' })
		]);
		expect(exchanges.map((exchange) => exchange.question)).toEqual(['Later?', 'Who signs off?']);
		expect(exchanges[1]).toMatchObject({
			id: 'a1',
			answerMarkdown: 'The site manager.',
			citedPageKeys: ['ops/sign-off'],
			askedAt: '2026-09-28T10:00:00+00:00'
		});
	});

	it('keeps conversations apart and drops a question with no answer', () => {
		const exchanges = pairExchanges([
			message({ id: 'q1', body: 'One?' }),
			message({ id: 'q2', body: 'Two?', conversationId: 'c2', memberId: 'u2' }),
			message({ id: 'a2', speaker: 'bot', body: 'Two.', conversationId: 'c2', memberId: 'u2' })
		]);
		expect(exchanges).toHaveLength(1);
		expect(exchanges[0]).toMatchObject({ question: 'Two?', memberId: 'u2' });
	});
});
