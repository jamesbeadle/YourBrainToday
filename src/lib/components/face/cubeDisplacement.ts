import type { FaceRigParameters } from './faceRigParameters';
import type { RigWeights } from './rigWeights';

export type CubeOffset = { across: number; up: number; depth: number };

const BROW_RAISE_LIFT = 0.04;
const BROW_FURROW_PULL = 0.05;
const BROW_FURROW_DROP = 0.028;
const JAW_SHELL_DROP = 0.16;
const LIP_LOWER_DROP = 0.16;
const UPPER_LIP_RAISE = 0.03;
const PARTING_HALF_SPAN = 0.3;
const PARTING_TAPER_CURVE = 0.7;
const MOUTH_WIDEN = 0.3;
const LIP_ROUND_PULL = 0.45;
const LIP_ROUND_FORWARD = 0.06;
const MOUTH_HOLLOW = 0.08;
const CAVITY_ANCHORING = 0.3;
const CAVITY_STRETCH = 1.4;
const SMILE_CORNER_LIFT = 0.09;
const SMILE_CORNER_SPREAD = 0.05;

function browOffset(across: number, weights: RigWeights, parameters: FaceRigParameters): CubeOffset {
	const furrow = Math.max(0, -parameters.browRaise);
	const inner = weights.browInner;
	return {
		across: -furrow * BROW_FURROW_PULL * inner * Math.sign(across),
		up: parameters.browRaise * BROW_RAISE_LIFT * weights.brow - furrow * BROW_FURROW_DROP * inner,
		depth: 0
	};
}

function partingTaperAt(across: number): number {
	const reach = Math.abs(across) / PARTING_HALF_SPAN;
	if (reach >= 1) return 0;
	return Math.pow(1 - reach * reach, PARTING_TAPER_CURVE);
}

function lipPartingLift(
	across: number,
	weights: RigWeights,
	parameters: FaceRigParameters
): number {
	const raised = UPPER_LIP_RAISE * weights.lipUpper;
	const dropped = LIP_LOWER_DROP * (1 - weights.lipUpper);
	return parameters.jawOpen * weights.lip * partingTaperAt(across) * (raised - dropped);
}

function mouthOffset(across: number, weights: RigWeights, parameters: FaceRigParameters): CubeOffset {
	const lip = weights.lip;
	return {
		across:
			across * lip * (parameters.mouthWidth * MOUTH_WIDEN - parameters.lipRound * LIP_ROUND_PULL) +
			parameters.mouthCurve * SMILE_CORNER_SPREAD * weights.corner,
		up:
			parameters.mouthCurve * SMILE_CORNER_LIFT * Math.abs(weights.corner) +
			lipPartingLift(across, weights, parameters),
		depth: lip * (parameters.lipRound * LIP_ROUND_FORWARD - parameters.jawOpen * MOUTH_HOLLOW)
	};
}

export function verticalStretchFor(weights: RigWeights, parameters: FaceRigParameters): number {
	return 1 + parameters.jawOpen * CAVITY_STRETCH * weights.cavity;
}

export function displacementFor(
	across: number,
	weights: RigWeights,
	parameters: FaceRigParameters
): CubeOffset {
	const brow = browOffset(across, weights, parameters);
	const mouth = mouthOffset(across, weights, parameters);
	const anchoring = 1 - weights.cavity * CAVITY_ANCHORING;
	return {
		across: brow.across + mouth.across,
		up: brow.up + mouth.up - parameters.jawOpen * JAW_SHELL_DROP * weights.jaw * anchoring,
		depth: brow.depth + mouth.depth
	};
}
