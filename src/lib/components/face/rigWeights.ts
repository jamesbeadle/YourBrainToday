import { eyeCentres } from './faceUpperFeatures';
import { mouthCentre } from './mouthRelief';
import { bandAt, bumpAt, fadeBetween } from './reliefShapes';

export type RigWeights = {
	jaw: number;
	lip: number;
	lipUpper: number;
	corner: number;
	brow: number;
	browInner: number;
	cavity: number;
	eyeIndex: number;
	eyeNearness: number;
};

const JAW_HINGE = -0.28;
const JAW_REACH = 0.85;
const LIP_HALF_SPAN = 0.32;
const LIP_HALF_HEIGHT = 0.1;
const CAVITY_CENTRE = { across: 0, up: -0.55 };
const CAVITY_HALF_SPAN = 0.27;
const CAVITY_HALF_HEIGHT = 0.13;
const CORNER_START = 0.5;
const BROW_HEIGHT = 0.435;
const BROW_THICKNESS = 0.2;
const BROW_OUTER_EDGE = 0.68;
const FOREHEAD_FOLLOW = 0.35;
const FOREHEAD_HEIGHT = 0.72;
const FOREHEAD_THICKNESS = 0.26;
const EYE_HALF_WIDTH = 0.175;
const EYE_HALF_HEIGHT = 0.105;

function jawWeightAt(up: number): number {
	return fadeBetween(JAW_HINGE, JAW_HINGE - JAW_REACH, up);
}

function browWeightAt(across: number, up: number): number {
	if (Math.abs(across) > BROW_OUTER_EDGE) return 0;
	const ridge = bandAt(up, BROW_HEIGHT, BROW_THICKNESS);
	const forehead = FOREHEAD_FOLLOW * bandAt(up, FOREHEAD_HEIGHT, FOREHEAD_THICKNESS);
	return Math.min(1, ridge + forehead);
}

function cornerWeightAt(across: number): number {
	const reach = Math.abs(across) / LIP_HALF_SPAN;
	if (reach < CORNER_START) return 0;
	return Math.sign(across) * ((reach - CORNER_START) / (1 - CORNER_START));
}

function eyeNearnessAt(across: number, up: number, index: number): number {
	return bumpAt(across, up, eyeCentres[index], EYE_HALF_WIDTH, EYE_HALF_HEIGHT);
}

export function rigWeightsAt(across: number, up: number): RigWeights {
	const lip = bumpAt(across, up, mouthCentre, LIP_HALF_SPAN, LIP_HALF_HEIGHT);
	const leftNearness = eyeNearnessAt(across, up, 0);
	const rightNearness = eyeNearnessAt(across, up, 1);
	const isLeftEye = leftNearness >= rightNearness;
	return {
		jaw: jawWeightAt(up),
		lip,
		lipUpper: up > mouthCentre.up ? 1 : 0,
		corner: cornerWeightAt(across) * lip,
		brow: browWeightAt(across, up),
		browInner: Math.max(0, 1 - Math.abs(across) / BROW_OUTER_EDGE),
		cavity: bumpAt(across, up, CAVITY_CENTRE, CAVITY_HALF_SPAN, CAVITY_HALF_HEIGHT),
		eyeIndex: isLeftEye ? 0 : 1,
		eyeNearness: Math.max(leftNearness, rightNearness)
	};
}
