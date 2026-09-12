import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addressRateLimit } from './addressRateLimit';

const allowance = 5;
const windowMilliseconds = 10 * 60 * 1000;
const oneSecondMilliseconds = 1000;

function attemptsFrom(
	limit: ReturnType<typeof addressRateLimit>,
	clientAddress: string,
	count: number
): boolean[] {
	return Array.from({ length: count }, () => limit.isAllowedFrom(clientAddress));
}

describe('addressRateLimit', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-09-05T18:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('allows the allowance within a window and refuses the next attempt', () => {
		const limit = addressRateLimit({ allowance, windowMilliseconds });
		const outcomes = attemptsFrom(limit, '203.0.113.1', allowance + 1);
		expect(outcomes.slice(0, allowance).every(Boolean)).toBe(true);
		expect(outcomes[allowance]).toBe(false);
	});

	it('keeps refusing until the oldest attempt leaves the window', () => {
		const limit = addressRateLimit({ allowance, windowMilliseconds });
		attemptsFrom(limit, '203.0.113.2', allowance);
		vi.advanceTimersByTime(windowMilliseconds - oneSecondMilliseconds);
		expect(limit.isAllowedFrom('203.0.113.2')).toBe(false);
		vi.advanceTimersByTime(oneSecondMilliseconds);
		expect(limit.isAllowedFrom('203.0.113.2')).toBe(true);
	});

	it('counts each address on its own', () => {
		const limit = addressRateLimit({ allowance, windowMilliseconds });
		attemptsFrom(limit, '203.0.113.3', allowance);
		expect(limit.isAllowedFrom('203.0.113.3')).toBe(false);
		expect(limit.isAllowedFrom('203.0.113.4')).toBe(true);
	});

	it('does not extend the window by refusing', () => {
		const limit = addressRateLimit({ allowance, windowMilliseconds });
		attemptsFrom(limit, '203.0.113.5', allowance);
		vi.advanceTimersByTime(windowMilliseconds / 2);
		expect(limit.isAllowedFrom('203.0.113.5')).toBe(false);
		vi.advanceTimersByTime(windowMilliseconds / 2);
		expect(limit.isAllowedFrom('203.0.113.5')).toBe(true);
	});
});
