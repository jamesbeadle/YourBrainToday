import { describe, expect, it } from 'vitest';
import { linkedSlugsFrom } from './pageCrossLinks';

describe('linkedSlugsFrom', () => {
	it('lists each linked slug once, leaving out the page itself', () => {
		const body =
			'See [A](/domain-brain/page-a), [A again](/domain-brain/page-a), ' +
			'[B](/domain-brain/page-b) and [me](/domain-brain/me).';
		expect(linkedSlugsFrom('me', body)).toEqual(['page-a', 'page-b']);
	});

	it('finds nothing in a body with no cross links', () => {
		expect(linkedSlugsFrom('me', 'Plain prose with an [outside link](https://example.com).')).toEqual([]);
	});
});
