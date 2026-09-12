export const usageWindowChoices = [7, 30, 90] as const;

export type UsageWindowDays = (typeof usageWindowChoices)[number];

export const defaultUsageWindowDays: UsageWindowDays = 30;

const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function parseUsageWindow(value: string | null): UsageWindowDays {
	const days = Number(value);
	const choice = usageWindowChoices.find((candidate) => candidate === days);
	return choice ?? defaultUsageWindowDays;
}

export function usageWindowStart(days: UsageWindowDays, now = new Date()): Date {
	return new Date(now.getTime() - days * millisecondsPerDay);
}
