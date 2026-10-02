import { describe, expect, it } from 'vitest';
import { filterKnowledgeIndex, toggled, unfilteredKnowledgeIndex } from './filterKnowledgeIndex';
import type { KnowledgeIndexEntry } from '$lib/data/knowledge/knowledgeIndex';

function entry(overrides: Partial<KnowledgeIndexEntry>): KnowledgeIndexEntry {
	return {
		id: overrides.title ?? 'entry',
		kind: 'expertise',
		kindLabel: 'Entity',
		brainId: 'brain-a',
		brainName: 'Brain A',
		title: 'Untitled',
		summary: '',
		detail: '',
		date: null,
		href: '/',
		...overrides
	};
}

const order = entry({ title: 'Order', summary: 'What a customer buys', brainId: 'brain-a' });
const survey = entry({ title: 'Survey signed off', kind: 'experience', brainId: 'brain-b', date: '2026-02-01' });
const visit = entry({ title: 'Site visit', kind: 'experience', brainId: 'brain-b', date: '2026-03-01' });
const entries = [visit, order, survey];

describe('filterKnowledgeIndex', () => {
	it('sorts by name when nothing is chosen', () => {
		const titles = filterKnowledgeIndex(entries, unfilteredKnowledgeIndex).map((hit) => hit.title);
		expect(titles).toEqual(['Order', 'Site visit', 'Survey signed off']);
	});

	it('matches typed text against the title and the summary', () => {
		const filter = { ...unfilteredKnowledgeIndex, text: 'customer' };
		expect(filterKnowledgeIndex(entries, filter)).toEqual([order]);
	});

	it('narrows by brain and by kind', () => {
		const byBrain = { ...unfilteredKnowledgeIndex, brainIds: ['brain-b'] };
		expect(filterKnowledgeIndex(entries, byBrain)).toHaveLength(2);
		const byKind = { ...unfilteredKnowledgeIndex, kinds: ['expertise' as const] };
		expect(filterKnowledgeIndex(entries, byKind)).toEqual([order]);
	});

	it('puts the newest first and the undated last', () => {
		const filter = { ...unfilteredKnowledgeIndex, sort: 'newest' as const };
		expect(filterKnowledgeIndex(entries, filter)).toEqual([visit, survey, order]);
	});
});

describe('toggled', () => {
	it('adds a missing value and removes a present one', () => {
		expect(toggled(['a'], 'b')).toEqual(['a', 'b']);
		expect(toggled(['a', 'b'], 'a')).toEqual(['b']);
	});
});
