const HEAD_HALF_WIDTH = 0.9;
const CROWN_HEIGHT = 1.24;
const CHIN_DEPTH = 1.3;
const CRANIUM_FULLNESS = 0.34;
const CRANIUM_SQUARENESS = 3.4;
const JAW_SQUARENESS = 2.6;
const JAW_ROUNDNESS = 0.4;
const CHEEKBONE_WIDTH = 1.04;
const CHEEKBONE_HEIGHT = -0.12;
const CHEEKBONE_SPAN = 0.44;
const JAW_TAPER = 0.34;

function craniumHalfWidthAt(up: number): number {
	const rise = up / CROWN_HEIGHT;
	if (rise >= 1) return 0;
	return HEAD_HALF_WIDTH * Math.pow(1 - Math.pow(rise, CRANIUM_SQUARENESS), CRANIUM_FULLNESS);
}

function jawHalfWidthAt(up: number): number {
	const drop = -up / CHIN_DEPTH;
	if (drop >= 1) return 0;
	const round = Math.pow(1 - Math.pow(drop, JAW_SQUARENESS), JAW_ROUNDNESS);
	return HEAD_HALF_WIDTH * round * (1 - JAW_TAPER * Math.pow(drop, 2.4));
}

function cheekboneFlareAt(up: number): number {
	const offset = (up - CHEEKBONE_HEIGHT) / CHEEKBONE_SPAN;
	return 1 + (CHEEKBONE_WIDTH - 1) * Math.exp(-offset * offset);
}

export function headHalfWidthAt(up: number): number {
	const profile = up >= 0 ? craniumHalfWidthAt(up) : jawHalfWidthAt(up);
	return profile * cheekboneFlareAt(up);
}

export function headEdgeNearness(across: number, up: number): number {
	const halfWidth = headHalfWidthAt(up);
	if (halfWidth <= 0) return 1;
	return Math.min(1, Math.abs(across) / halfWidth);
}

export const HEAD_CROWN = CROWN_HEIGHT;
export const HEAD_CHIN = -CHIN_DEPTH;
