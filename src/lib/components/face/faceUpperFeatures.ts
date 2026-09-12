import { bandAt, bumpAt } from './reliefShapes';

export const eyeCentres = [
	{ across: -0.345, up: 0.235 },
	{ across: 0.345, up: 0.235 }
];

const BROW_HEIGHT = 0.435;
const BROW_THICKNESS = 0.13;
const BROW_INNER_EDGE = 0.08;
const BROW_OUTER_EDGE = 0.66;
const BROW_RELIEF = 0.085;
const GLABELLA_RELIEF = 0.028;
const SOCKET_HALF_WIDTH = 0.285;
const SOCKET_HALF_HEIGHT = 0.175;
const SOCKET_RELIEF = 0.255;
const EYEBALL_HALF_WIDTH = 0.135;
const EYEBALL_HALF_HEIGHT = 0.1;
const EYEBALL_RELIEF = 0.105;
const TEMPLE_RELIEF = 0.05;
const TEMPLE_CENTRES = [
	{ across: -0.73, up: 0.47 },
	{ across: 0.73, up: 0.47 }
];
const FOREHEAD_RELIEF = 0.035;
const FOREHEAD_CENTRE = { across: 0, up: 0.78 };

function browRidgeAt(across: number, up: number): number {
	const reach = Math.abs(across);
	if (reach > BROW_OUTER_EDGE) return 0;
	const inner = Math.max(0, Math.min(1, (reach - BROW_INNER_EDGE) / 0.16));
	const outer = Math.max(0, Math.min(1, (BROW_OUTER_EDGE - reach) / 0.22));
	return BROW_RELIEF * inner * outer * bandAt(up, BROW_HEIGHT, BROW_THICKNESS);
}

function eyeSocketsAt(across: number, up: number): number {
	let relief = 0;
	for (const centre of eyeCentres) {
		relief -= SOCKET_RELIEF * bumpAt(across, up, centre, SOCKET_HALF_WIDTH, SOCKET_HALF_HEIGHT);
		relief += EYEBALL_RELIEF * bumpAt(across, up, centre, EYEBALL_HALF_WIDTH, EYEBALL_HALF_HEIGHT);
	}
	return relief;
}

function templeHollowsAt(across: number, up: number): number {
	let relief = 0;
	for (const centre of TEMPLE_CENTRES) {
		relief -= TEMPLE_RELIEF * bumpAt(across, up, centre, 0.24, 0.3);
	}
	return relief;
}

export function upperFeatureDepthAt(across: number, up: number): number {
	return (
		browRidgeAt(across, up) +
		eyeSocketsAt(across, up) +
		templeHollowsAt(across, up) +
		FOREHEAD_RELIEF * bumpAt(across, up, FOREHEAD_CENTRE, 0.5, 0.34) -
		GLABELLA_RELIEF * bumpAt(across, up, { across: 0, up: 0.4 }, 0.09, 0.11)
	);
}
