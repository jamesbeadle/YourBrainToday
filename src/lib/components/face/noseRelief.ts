import { bumpAt, taperedTo } from './reliefShapes';

const BRIDGE_TOP = 0.34;
const NOSE_TIP = -0.15;
const BRIDGE_HALF_WIDTH = 0.075;
const TIP_HALF_WIDTH = 0.125;
const BRIDGE_RELIEF = 0.045;
const TIP_RELIEF = 0.235;
const WIDTH_CURVE = 2.4;
const RELIEF_CURVE = 1.7;
const UNDERSIDE_FADE = 0.3;
const WING_RELIEF = 0.1;
const WING_CENTRES = [
	{ across: -0.145, up: -0.145 },
	{ across: 0.145, up: -0.145 }
];
const NOSTRIL_RELIEF = 0.105;
const NOSTRIL_CENTRES = [
	{ across: -0.085, up: -0.175 },
	{ across: 0.085, up: -0.175 }
];

function ridgeAt(across: number, up: number): number {
	const progress = (BRIDGE_TOP - up) / (BRIDGE_TOP - NOSE_TIP);
	if (progress < 0 || progress > 1 + UNDERSIDE_FADE) return 0;
	const along = taperedTo(progress, 1);
	const halfWidth =
		BRIDGE_HALF_WIDTH + (TIP_HALF_WIDTH - BRIDGE_HALF_WIDTH) * taperedTo(along, WIDTH_CURVE);
	const relief = BRIDGE_RELIEF + (TIP_RELIEF - BRIDGE_RELIEF) * taperedTo(along, RELIEF_CURVE);
	const offset = across / halfWidth;
	const underside = 1 - Math.max(0, progress - 1) / UNDERSIDE_FADE;
	return relief * Math.exp(-offset * offset) * underside;
}

function wingsAt(across: number, up: number): number {
	let relief = 0;
	for (const centre of WING_CENTRES) {
		relief += WING_RELIEF * bumpAt(across, up, centre, 0.085, 0.075);
	}
	for (const centre of NOSTRIL_CENTRES) {
		relief -= NOSTRIL_RELIEF * bumpAt(across, up, centre, 0.05, 0.04);
	}
	return relief;
}

export function noseDepthAt(across: number, up: number): number {
	return ridgeAt(across, up) + wingsAt(across, up);
}
