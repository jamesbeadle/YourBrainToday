const SLOW_RATE = 0.11;
const MEDIUM_RATE = 0.31;
const QUICK_RATE = 0.53;
const SLOW_WEIGHT = 0.3;
const MEDIUM_WEIGHT = 0.55;
const QUICK_WEIGHT = 0.15;
const SEED_SPREAD = 12.9898;
const SEED_TWIST = 3.7;
const SEED_TURN = 7.3;

export function wanderAt(timeSeconds: number, seed: number): number {
	return (
		Math.sin(timeSeconds * MEDIUM_RATE + seed * SEED_SPREAD) * MEDIUM_WEIGHT +
		Math.sin(timeSeconds * SLOW_RATE + seed * SEED_TWIST) * SLOW_WEIGHT +
		Math.sin(timeSeconds * QUICK_RATE + seed * SEED_TURN) * QUICK_WEIGHT
	);
}
