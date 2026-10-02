import { describe, expect, it } from 'vitest';
import { isRetryableStatus, planAttempt, requestBudgetMilliseconds } from './anthropicRetry';

describe('planAttempt', () => {
	it('gives the first attempt the longest timeout', () => {
		expect(planAttempt(0, 0, 0)).toEqual({ timeoutMilliseconds: 200_000 });
	});

	it('shortens a retry to what the budget has left', () => {
		const plan = planAttempt(0, 1, 100_000);
		expect(plan?.timeoutMilliseconds).toBe(requestBudgetMilliseconds - 100_000 - 2_000);
	});

	it('refuses a retry the budget cannot hold', () => {
		expect(planAttempt(0, 1, 240_000)).toBeNull();
		expect(planAttempt(0, 3, 0)).toBeNull();
	});
});

describe('isRetryableStatus', () => {
	it('retries overload and rate limits but not bad requests', () => {
		expect(isRetryableStatus(529)).toBe(true);
		expect(isRetryableStatus(429)).toBe(true);
		expect(isRetryableStatus(400)).toBe(false);
	});
});
