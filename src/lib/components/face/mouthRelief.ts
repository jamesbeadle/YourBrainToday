import { bandAt, bumpAt } from './reliefShapes';

export const mouthCentre = { across: 0, up: -0.5 };

const LIP_HALF_SPAN = 0.29;
const UPPER_LIP_HEIGHT = -0.45;
const LOWER_LIP_HEIGHT = -0.565;
const UPPER_LIP_RELIEF = 0.05;
const LOWER_LIP_RELIEF = 0.065;
const LIP_THICKNESS = 0.042;
const PARTING_RELIEF = 0.07;
const PARTING_THICKNESS = 0.024;
const PHILTRUM_RELIEF = 0.03;
const CHIN_CREASE_RELIEF = 0.035;
const CHIN_RELIEF = 0.075;
const CHIN_CENTRE = { across: 0, up: -0.84 };

function lipSpanAt(across: number): number {
	const reach = Math.abs(across) / LIP_HALF_SPAN;
	if (reach >= 1) return 0;
	return Math.pow(1 - reach * reach, 0.6);
}

function lipsAt(across: number, up: number): number {
	const span = lipSpanAt(across);
	if (span <= 0) return 0;
	const upper = UPPER_LIP_RELIEF * bandAt(up, UPPER_LIP_HEIGHT, LIP_THICKNESS);
	const lower = LOWER_LIP_RELIEF * bandAt(up, LOWER_LIP_HEIGHT, LIP_THICKNESS);
	const parting = PARTING_RELIEF * bandAt(up, mouthCentre.up, PARTING_THICKNESS);
	return span * (upper + lower - parting);
}

export function mouthDepthAt(across: number, up: number): number {
	return (
		lipsAt(across, up) -
		PHILTRUM_RELIEF * bumpAt(across, up, { across: 0, up: -0.375 }, 0.045, 0.06) -
		CHIN_CREASE_RELIEF * bumpAt(across, up, { across: 0, up: -0.68 }, 0.19, 0.05) +
		CHIN_RELIEF * bumpAt(across, up, CHIN_CENTRE, 0.26, 0.19)
	);
}
