import { describe, expect, it } from 'vitest';
import { buildHumanConstellation } from './humanConstellation';
import { personPage } from './personPage';
import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

function item(
	id: string,
	itemKind: string,
	title: string,
	data: Record<string, unknown>,
	body = ''
): KbBrainItem {
	return {
		id,
		itemKind,
		title,
		body,
		data,
		parentItemId: null,
		position: 0,
		occurredAt: null,
		validFrom: null,
		validTo: null,
		createdAt: '2026-09-25T00:00:00Z'
	};
}

const items = [
	item('sarah', 'person', 'Sarah Hartley', { role: 'Client PM', organisation: 'Hartley Homes' }),
	item('dave', 'person', 'Dave', { role: 'Site manager', organisation: '' }),
	item('priya', 'person', 'Priya', { role: 'QS', organisation: 'Hartley Homes' }),
	item(
		'c1',
		'connection',
		'fell out with',
		{ from: 'dave', to: 'Sarah Hartley', warmth: 'cool' },
		'Hartley job'
	),
	item('c2', 'connection', 'trusts', { from: 'Priya', to: 'Dave', warmth: 'close' }),
	item('c3', 'connection', 'knows', { from: 'Dave', to: 'Nobody Here', warmth: 'warm' })
];

describe('buildHumanConstellation', () => {
	it('gathers people into their organisations', () => {
		const constellation = buildHumanConstellation(items);
		expect(constellation.contexts.map((context) => context.name)).toEqual(['Hartley Homes']);
		const dave = constellation.pageIndex.find((page) => page.slug === 'dave');
		expect(dave?.contextSlug).toBeNull();
	});

	it('draws a fibre for every relationship between two known people, matching names loosely', () => {
		const { pageLinks } = buildHumanConstellation(items);
		expect(pageLinks).toEqual([
			{ fromSlug: 'dave', toSlug: 'sarah' },
			{ fromSlug: 'priya', toSlug: 'dave' }
		]);
	});
});

describe('personPage', () => {
	it('lists a person’s relationships warmest first', async () => {
		const { page } = await personPage(items, 'dave');
		const closeAt = page.body.indexOf('Close');
		const coolAt = page.body.indexOf('Cool');
		expect(closeAt).toBeGreaterThan(-1);
		expect(closeAt).toBeLessThan(coolAt);
		expect(page.body).toContain('fell out with · Sarah Hartley — Hartley job');
	});
});
