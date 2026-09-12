export type ReliefCentre = { across: number; up: number };

export function bumpAt(
	across: number,
	up: number,
	centre: ReliefCentre,
	halfWidth: number,
	halfHeight: number
): number {
	const acrossOffset = (across - centre.across) / halfWidth;
	const upOffset = (up - centre.up) / halfHeight;
	return Math.exp(-(acrossOffset * acrossOffset + upOffset * upOffset));
}

export function bandAt(value: number, centre: number, halfWidth: number): number {
	const offset = (value - centre) / halfWidth;
	return Math.exp(-offset * offset);
}

export function taperedTo(progress: number, curve: number): number {
	return Math.pow(Math.max(0, Math.min(1, progress)), curve);
}

export function fadeBetween(start: number, end: number, value: number): number {
	if (start === end) return value >= end ? 1 : 0;
	const progress = Math.max(0, Math.min(1, (value - start) / (end - start)));
	return progress * progress * (3 - 2 * progress);
}

export function mixTowards(from: number, to: number, amount: number): number {
	return from + (to - from) * amount;
}
