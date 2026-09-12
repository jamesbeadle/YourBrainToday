import { reliefSampleAt, type ReliefSample } from './faceRelief';
import { noiseAt } from './gridNoise';
import { HEAD_CHIN, HEAD_CROWN, headHalfWidthAt } from './headSilhouette';
import { collectMouthInteriorPlacements } from './mouthInterior';
import { CUBE_PITCH } from './reliefPalette';
import { fadeBetween, mixTowards } from './reliefShapes';
import { loosenedShade, shadeFor } from './reliefShade';
import { rigWeightsAt, type RigWeights } from './rigWeights';

const EDGE_SOLID_UNTIL = 0.63;
const EDGE_SURVIVAL_FLOOR = 0.02;
const EDGE_DRIFT = 0.2;
const EDGE_SHADE = 0.72;
const EDGE_SHRINK = 0.45;
const CROWN_BITE = 2.6;
const LONGEST_STACK = 8;
const GRAIN = 0.07;

export type CubePlacement = {
	across: number;
	up: number;
	depth: number;
	size: number;
	shade: number;
	weights: RigWeights;
};

function edgeNearnessAt(across: number, up: number): number {
	const halfWidth = headHalfWidthAt(up);
	if (halfWidth <= 0) return 1;
	const sideways = Math.abs(across) / halfWidth;
	const vertical = up >= 0 ? up / HEAD_CROWN : up / HEAD_CHIN;
	return Math.max(sideways, Math.pow(Math.max(0, vertical), CROWN_BITE));
}

function terracedDepth(depth: number): number {
	return Math.round(depth / CUBE_PITCH) * CUBE_PITCH;
}

function stackHeightFor(standProud: number, dissolve: number): number {
	const reach = 1 + Math.round((standProud / CUBE_PITCH) * (1 - dissolve));
	return Math.max(1, Math.min(LONGEST_STACK, reach));
}

function driftAt(column: number, row: number, dissolve: number): number {
	return (noiseAt(column, row, 7) - 0.5) * EDGE_DRIFT * dissolve;
}

function shadeForCube(
	sample: ReliefSample,
	layer: number,
	dissolve: number,
	grain: number
): number {
	const lit = shadeFor(sample.depth, sample.occlusion, layer);
	const grained = lit + (grain - 0.5) * GRAIN;
	return loosenedShade(grained, dissolve, EDGE_SHADE);
}

export function collectCubePlacements(): CubePlacement[] {
	const placements: CubePlacement[] = collectMouthInteriorPlacements();
	const lowestRow = Math.floor(HEAD_CHIN / CUBE_PITCH);
	const highestRow = Math.ceil(HEAD_CROWN / CUBE_PITCH);
	for (let row = lowestRow; row <= highestRow; row += 1) {
		const up = row * CUBE_PITCH;
		const halfWidth = headHalfWidthAt(up);
		const widestColumn = Math.ceil(halfWidth / CUBE_PITCH);
		for (let column = -widestColumn; column <= widestColumn; column += 1) {
			const across = column * CUBE_PITCH;
			const edge = edgeNearnessAt(across, up);
			if (edge >= 1) continue;
			const dissolve = fadeBetween(EDGE_SOLID_UNTIL, 1, edge);
			const survival = mixTowards(1, EDGE_SURVIVAL_FLOOR, dissolve);
			if (noiseAt(column, row, 3) > survival) continue;
			const sample = reliefSampleAt(across, up);
			const weights = rigWeightsAt(across, up);
			const surface = terracedDepth(sample.depth);
			const stack = stackHeightFor(sample.standProud, dissolve);
			for (let layer = 0; layer < stack; layer += 1) {
				placements.push({
					across: across + driftAt(column, row, dissolve),
					up: up + driftAt(column, row + 1, dissolve),
					depth: surface - layer * CUBE_PITCH - dissolve * EDGE_DRIFT,
					size: 1 - dissolve * EDGE_SHRINK,
					shade: shadeForCube(sample, layer, dissolve, noiseAt(column, row, 29)),
					weights
				});
			}
		}
	}
	return placements;
}
