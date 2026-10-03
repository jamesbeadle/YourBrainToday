import { describe, expect, it } from 'vitest';
import { hitsWithPageKeys, renderKnowledgeHits } from './renderKnowledgeHits';
import type { ExpertiseBrainModel } from '$lib/server/knowledge/reading/readExpertiseBrains';
import type { KnowledgeHit } from './searchKnowledgeBase';

const expertise = [{ kbBrainId: 'kb-brain-1', handle: 'ops-1a2b', name: 'Ops' }] as ExpertiseBrainModel[];
const brainNames = new Map([['kb-brain-2', 'Site diary']]);

const pageHit: KnowledgeHit = {
	hitKind: 'page',
	brainId: 'kb-brain-1',
	itemId: 'p1',
	slug: 'sign-off',
	itemKind: 'page',
	title: 'Sign-off',
	snippet: 'the site manager signs',
	rank: 1
};

const itemHit: KnowledgeHit = { ...pageHit, hitKind: 'item', brainId: 'kb-brain-2', slug: null, itemKind: 'episode', title: 'Week 3' };

describe('renderKnowledgeHits', () => {
	it('keys a page hit for read_pages and names the brain of an item hit', () => {
		const rendered = renderKnowledgeHits([pageHit, itemHit], expertise, brainNames);
		expect(rendered).toBe(
			'- page ops-1a2b/sign-off — Sign-off: the site manager signs\n- episode in Site diary — Week 3: the site manager signs'
		);
	});

	it('says so when nothing matched', () => {
		expect(renderKnowledgeHits([], expertise, brainNames)).toContain('Nothing');
	});

	it('gives the API the page key and brain name beside each hit', () => {
		const [keyedPage, keyedItem] = hitsWithPageKeys([pageHit, itemHit], expertise, brainNames);
		expect(keyedPage.pageKey).toBe('ops-1a2b/sign-off');
		expect(keyedPage.brainName).toBe('Ops');
		expect(keyedItem.pageKey).toBeNull();
		expect(keyedItem.brainName).toBe('Site diary');
	});
});
