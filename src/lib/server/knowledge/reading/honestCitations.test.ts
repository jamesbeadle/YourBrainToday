import { describe, expect, it } from 'vitest';
import { keepCitablePageKeys } from './honestCitations';

describe('keepCitablePageKeys', () => {
	it('keeps the pages that were read or indexed and drops the rest', () => {
		const kept = keepCitablePageKeys(
			['ops-1a2b/sign-off', 'ops-1a2b/made-up', 'ops-1a2b/variations'],
			['ops-1a2b/sign-off', 'ops-1a2b/variations']
		);
		expect(kept).toEqual(['ops-1a2b/sign-off', 'ops-1a2b/variations']);
	});

	it('cites each page once however often the model named it', () => {
		expect(keepCitablePageKeys(['a/b', 'a/b'], ['a/b'])).toEqual(['a/b']);
	});

	it('cites nothing when nothing citable was named', () => {
		expect(keepCitablePageKeys(['a/b'], [])).toEqual([]);
	});
});
