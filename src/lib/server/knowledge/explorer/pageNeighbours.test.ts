import { describe, expect, it } from 'vitest';
import { pageNeighboursOf } from './pageNeighbours';
import type { BrainPageSummary } from '$lib/data/brainModelTypes';

function page(slug: string, title: string, contextSlug: string | null = 'sales'): BrainPageSummary {
	return { slug, title, summary: '', kind: 'entity', contextSlug };
}

const order = page('order', 'Order');
const customer = page('customer', 'Customer');
const quote = page('quote', 'Quote');
const site = page('site', 'Site', 'delivery');
const pageIndex = [order, customer, quote, site];
const pageLinks = [
	{ fromSlug: 'order', toSlug: 'customer' },
	{ fromSlug: 'quote', toSlug: 'order' },
	{ fromSlug: 'site', toSlug: 'order' },
	{ fromSlug: 'order', toSlug: 'missing' }
];

describe('pageNeighboursOf', () => {
	const neighbours = pageNeighboursOf('order', 'sales', pageIndex, pageLinks);

	it('finds who links in and where the page links out, by title', () => {
		expect(neighbours.linkedFrom).toEqual([quote, site]);
		expect(neighbours.linksTo).toEqual([customer]);
	});

	it('reads the context in title order around the page', () => {
		expect(neighbours.siblings).toEqual([customer, quote]);
		expect(neighbours.previous).toEqual(customer);
		expect(neighbours.next).toEqual(quote);
	});

	it('has no previous at the start and no next at the end', () => {
		expect(pageNeighboursOf('customer', 'sales', pageIndex, pageLinks).previous).toBeNull();
		expect(pageNeighboursOf('quote', 'sales', pageIndex, pageLinks).next).toBeNull();
	});
});
