import { headEdgeNearness, HEAD_CHIN, HEAD_CROWN } from './headSilhouette';

const FACE_DEPTH = 0.78;
const PROFILE_FLATNESS = 0.55;
const CROWN_FALL_CURVE = 3.6;
const CHIN_FALL_CURVE = 3.0;
const CROWN_FALL_DEPTH = 0.34;
const CHIN_FALL_DEPTH = 0.4;

function verticalFallAt(up: number): number {
	const limit = up >= 0 ? HEAD_CROWN : HEAD_CHIN;
	const curve = up >= 0 ? CROWN_FALL_CURVE : CHIN_FALL_CURVE;
	const depth = up >= 0 ? CROWN_FALL_DEPTH : CHIN_FALL_DEPTH;
	const reach = Math.min(1, Math.abs(up / limit));
	return 1 - depth * Math.pow(reach, curve);
}

export function craniumDepthAt(across: number, up: number): number {
	const nearness = headEdgeNearness(across, up);
	const acrossFall = Math.pow(Math.max(0, 1 - nearness * nearness), PROFILE_FLATNESS);
	return FACE_DEPTH * acrossFall * verticalFallAt(up);
}
