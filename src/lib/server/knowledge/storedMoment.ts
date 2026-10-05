const fullCalendarDay = /^\d{4}-\d{2}-\d{2}/;

/**
 * A moment as the timestamptz columns hold it, or null when the value does
 * not name one. A month or a year on its own ("2026-05") is not a moment the
 * column accepts, and inventing a day for it would misdate the record, so it
 * reads as no date at all.
 */
export function storedMomentFrom(value: string): string | null {
	const trimmed = value.trim();
	if (!fullCalendarDay.test(trimmed)) return null;
	const parsed = new Date(trimmed);
	return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
