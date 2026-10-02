import { describe, expect, it } from 'vitest';
import { isStageStalled, parseReadingProgress, stageAfter, stageStallMilliseconds } from './sourceReading';

describe('stageAfter', () => {
	it('walks the four stages in order and ends', () => {
		expect(stageAfter('model')).toBe('experience');
		expect(stageAfter('experience')).toBe('process');
		expect(stageAfter('process')).toBe('people');
		expect(stageAfter('people')).toBeNull();
	});
});

describe('isStageStalled', () => {
	it('treats a stage nobody started as free to take', () => {
		expect(isStageStalled(null)).toBe(true);
	});

	it('leaves a stage alone while a function could still be running it', () => {
		const now = Date.now();
		expect(isStageStalled(new Date(now - 1000).toISOString(), now)).toBe(false);
		expect(isStageStalled(new Date(now - stageStallMilliseconds - 1).toISOString(), now)).toBe(true);
	});
});

describe('parseReadingProgress', () => {
	it('fills the counts a stored row lacks', () => {
		expect(parseReadingProgress({ episodes: 3 }).episodes).toBe(3);
		expect(parseReadingProgress({ episodes: 3 }).people).toBe(0);
		expect(parseReadingProgress(null).meteredCalls).toEqual([]);
	});
});
