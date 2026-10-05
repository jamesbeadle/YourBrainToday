import { describe, expect, it } from 'vitest';
import { storedMomentFrom } from './storedMoment';

describe('storedMomentFrom', () => {
	it('keeps a full calendar day as an ISO moment', () => {
		expect(storedMomentFrom('2026-05-14')).toBe('2026-05-14T00:00:00.000Z');
		expect(storedMomentFrom(' 2026-05-14T09:30:00Z ')).toBe('2026-05-14T09:30:00.000Z');
	});

	it('reads a month or a year on its own as no date', () => {
		expect(storedMomentFrom('2026-05')).toBeNull();
		expect(storedMomentFrom('2026')).toBeNull();
	});

	it('reads anything that is not a date as no date', () => {
		expect(storedMomentFrom('')).toBeNull();
		expect(storedMomentFrom('spring 2026')).toBeNull();
		expect(storedMomentFrom('2026-13-40')).toBeNull();
	});
});
