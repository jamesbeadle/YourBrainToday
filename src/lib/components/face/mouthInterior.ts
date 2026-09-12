import type { CubePlacement } from './cubePlacements';
import { reliefSampleAt } from './faceRelief';
import { noiseAt } from './gridNoise';
import { mouthCentre } from './mouthRelief';
import { CUBE_PITCH } from './reliefPalette';
import { bumpAt } from './reliefShapes';
import type { RigWeights } from './rigWeights';

const INTERIOR_CENTRE = { across: 0, up: -0.56 };
const INTERIOR_HALF_SPAN = 0.26;
const INTERIOR_HALF_HEIGHT = 0.15;
const INTERIOR_RECESS = 0.12;
const TEETH_FORWARD = 0.03;
const TEETH_BOTTOM = -0.575;
const TEETH_ARCH_RISE = 0.05;
const TOOTH_WIDTH = 0.075;
const TOOTH_EDGE_STARTS = 0.8;
const TOOTH_SHADE = 0.78;
const TOOTH_EDGE_SHADE = 0.5;
const CAVITY_SHADE = 0.05;
const CAVITY_GRAIN = 0.04;
const TONGUE_CENTRE = { across: 0, up: -0.675 };
const TONGUE_HALF_SPAN = 0.17;
const TONGUE_HALF_HEIGHT = 0.055;
const TONGUE_SHADE = 0.16;

const stillWeights: RigWeights = {
	jaw: 0, lip: 0, lipUpper: 0, corner: 0, brow: 0,
	browInner: 0, cavity: 0, eyeIndex: 0, eyeNearness: 0
};

function teethBottomAt(across: number): number {
	const reach = Math.abs(across) / INTERIOR_HALF_SPAN;
	return TEETH_BOTTOM + reach * reach * TEETH_ARCH_RISE;
}

function isToothAt(across: number, up: number): boolean {
	return up >= teethBottomAt(across);
}

function toothShadeAt(across: number): number {
	const phase = Math.abs((((across / TOOTH_WIDTH) % 1) + 1.5) % 1 - 0.5) * 2;
	return phase >= TOOTH_EDGE_STARTS ? TOOTH_EDGE_SHADE : TOOTH_SHADE;
}

function cavityShadeAt(across: number, up: number, grain: number): number {
	const tongue = bumpAt(across, up, TONGUE_CENTRE, TONGUE_HALF_SPAN, TONGUE_HALF_HEIGHT);
	const rested = CAVITY_SHADE + (grain - 0.5) * CAVITY_GRAIN;
	return rested + (TONGUE_SHADE - rested) * tongue;
}

function interiorShadeAt(across: number, up: number, grain: number): number {
	if (isToothAt(across, up)) return toothShadeAt(across);
	return cavityShadeAt(across, up, grain);
}

function interiorHalfSpanAt(up: number): number {
	const vertical = (up - INTERIOR_CENTRE.up) / INTERIOR_HALF_HEIGHT;
	if (Math.abs(vertical) >= 1) return 0;
	return INTERIOR_HALF_SPAN * Math.sqrt(1 - vertical * vertical);
}

export function collectMouthInteriorPlacements(): CubePlacement[] {
	const placements: CubePlacement[] = [];
	const restingDepth = reliefSampleAt(mouthCentre.across, mouthCentre.up).depth - INTERIOR_RECESS;
	const lowestRow = Math.floor((INTERIOR_CENTRE.up - INTERIOR_HALF_HEIGHT) / CUBE_PITCH);
	const highestRow = Math.ceil((INTERIOR_CENTRE.up + INTERIOR_HALF_HEIGHT) / CUBE_PITCH);
	for (let row = lowestRow; row <= highestRow; row += 1) {
		const up = row * CUBE_PITCH;
		const halfSpan = interiorHalfSpanAt(up);
		const widestColumn = Math.floor(halfSpan / CUBE_PITCH);
		for (let column = -widestColumn; column <= widestColumn; column += 1) {
			const across = column * CUBE_PITCH;
			placements.push({
				across,
				up,
				depth: restingDepth + (isToothAt(across, up) ? TEETH_FORWARD : 0),
				size: 1,
				shade: interiorShadeAt(across, up, noiseAt(column, row, 41)),
				weights: stillWeights
			});
		}
	}
	return placements;
}
