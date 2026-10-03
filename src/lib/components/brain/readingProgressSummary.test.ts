import { describe, expect, it } from 'vitest';
import { emptyReadingProgress } from '$lib/data/sourceReading';
import { readingSuccessLine } from './readingProgressSummary';

describe('readingSuccessLine', () => {
	it('names only what the reading added, in the plural that fits', () => {
		const progress = {
			...emptyReadingProgress,
			pagesCreated: 1,
			episodes: 3,
			people: 2
		};
		expect(readingSuccessLine(progress)).toBe(
			'In the brain — 1 page created, 3 episodes, 2 people.'
		);
	});

	it('says so when nothing was added', () => {
		expect(readingSuccessLine(emptyReadingProgress)).toBe('In the brain — nothing new to add.');
	});
});
