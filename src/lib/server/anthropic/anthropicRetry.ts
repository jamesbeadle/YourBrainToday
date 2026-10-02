// A request to Anthropic runs inside one serverless function, so every
// attempt and every pause between attempts shares a single budget that stays
// inside the function's own limit. Overloaded, rate-limited and server-side
// failures are worth a second try; anything else is reported at once.

const retryableStatuses = new Set([408, 429, 500, 502, 503, 529]);

export const requestBudgetMilliseconds = 270_000;
const longestAttemptMilliseconds = 200_000;
const shortestWorthwhileAttemptMilliseconds = 45_000;
const pauseBeforeRetryMilliseconds = [2_000, 6_000];

export type AttemptPlan = { timeoutMilliseconds: number } | null;

export function isRetryableStatus(status: number): boolean {
	return retryableStatuses.has(status);
}

export function isRetryableFailure(failure: unknown): boolean {
	if (!(failure instanceof Error)) return false;
	return failure.name === 'TimeoutError' || failure.name === 'AbortError' || failure.name === 'TypeError';
}

/** The next attempt's timeout, or null when the budget left would not hold a useful one. */
export function planAttempt(startedAt: number, attemptIndex: number, now = Date.now()): AttemptPlan {
	const pause = attemptIndex === 0 ? 0 : (pauseBeforeRetryMilliseconds[attemptIndex - 1] ?? -1);
	if (pause < 0) return null;
	const remaining = requestBudgetMilliseconds - (now - startedAt) - pause;
	if (remaining < shortestWorthwhileAttemptMilliseconds) return null;
	return { timeoutMilliseconds: Math.min(longestAttemptMilliseconds, remaining) };
}

export function pauseBefore(attemptIndex: number): number {
	return attemptIndex === 0 ? 0 : (pauseBeforeRetryMilliseconds[attemptIndex - 1] ?? 0);
}

export function wait(milliseconds: number): Promise<void> {
	if (milliseconds <= 0) return Promise.resolve();
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
