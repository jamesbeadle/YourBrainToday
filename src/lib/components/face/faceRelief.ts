import { craniumDepthAt } from './craniumDepth';
import { upperFeatureDepthAt } from './faceUpperFeatures';
import { mouthDepthAt } from './mouthRelief';
import { noseDepthAt } from './noseRelief';
import { bumpAt } from './reliefShapes';

const CHEEK_RELIEF = 0.055;
const CHEEK_CENTRES = [
	{ across: -0.47, up: -0.12 },
	{ across: 0.47, up: -0.12 }
];
const NEIGHBOUR_REACH = 0.062;
const NEIGHBOUR_DIRECTIONS = [
	{ across: 1, up: 0 },
	{ across: -1, up: 0 },
	{ across: 0, up: 1 },
	{ across: 0, up: -1 }
];
const OCCLUSION_STRENGTH = 13;

export type ReliefSample = { depth: number; occlusion: number; standProud: number };

function cheeksAt(across: number, up: number): number {
	let relief = 0;
	for (const centre of CHEEK_CENTRES) {
		relief += CHEEK_RELIEF * bumpAt(across, up, centre, 0.3, 0.28);
	}
	return relief;
}

function reliefDepthAt(across: number, up: number): number {
	return (
		craniumDepthAt(across, up) +
		upperFeatureDepthAt(across, up) +
		noseDepthAt(across, up) +
		mouthDepthAt(across, up) +
		cheeksAt(across, up)
	);
}

export function reliefSampleAt(across: number, up: number): ReliefSample {
	const depth = reliefDepthAt(across, up);
	let raised = 0;
	let standProud = 0;
	for (const direction of NEIGHBOUR_DIRECTIONS) {
		const neighbour = reliefDepthAt(
			across + direction.across * NEIGHBOUR_REACH,
			up + direction.up * NEIGHBOUR_REACH
		);
		raised += Math.max(0, neighbour - depth);
		standProud = Math.max(standProud, depth - neighbour);
	}
	const occlusion = (raised / NEIGHBOUR_DIRECTIONS.length) * OCCLUSION_STRENGTH;
	return { depth, occlusion: Math.min(1, occlusion), standProud };
}
