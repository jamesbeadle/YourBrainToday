import { eyeCentres } from './faceUpperFeatures';
import { bumpAt, fadeBetween, mixTowards } from './reliefShapes';

export type EyeLook = { openness: number; gazeAcross: number; gazeUp: number };

export const restingLook: EyeLook = { openness: 1, gazeAcross: 0, gazeUp: 0 };

const APERTURE_HALF_WIDTH = 0.17;
const APERTURE_HALF_HEIGHT = 0.085;
const APERTURE_OPENS_AT = 0.3;
const APERTURE_FULLY_OPEN_AT = 0.62;
const LID_CLOSED_FLOOR = 0.18;
const LID_DROP = 0.03;
const LID_HIDES_BELOW = 0;
const LID_FULLY_SHOWS_AT = 0.35;
const SCLERA_SHADE = 0.42;
const IRIS_SHADE = 0.12;
const PUPIL_SHADE = 0.02;
const IRIS_RADIUS = 0.1;
const PUPIL_RADIUS = 0.045;
const GAZE_REACH = 0.042;

function apertureAt(
	across: number,
	up: number,
	centre: (typeof eyeCentres)[number],
	look: EyeLook
): number {
	const lidScale = LID_CLOSED_FLOOR + (1 - LID_CLOSED_FLOOR) * look.openness;
	const lidded = up + (1 - Math.min(1, look.openness)) * LID_DROP;
	return bumpAt(across, lidded, centre, APERTURE_HALF_WIDTH, APERTURE_HALF_HEIGHT * lidScale);
}

function eyeAperturesAt(across: number, up: number, look: EyeLook): number {
	return Math.max(
		apertureAt(across, up, eyeCentres[0], look),
		apertureAt(across, up, eyeCentres[1], look)
	);
}

function shadeWithinEye(across: number, up: number, look: EyeLook): number {
	let closest = SCLERA_SHADE;
	for (const centre of eyeCentres) {
		const reach = Math.hypot(
			across - centre.across - look.gazeAcross * GAZE_REACH,
			(up - centre.up - look.gazeUp * GAZE_REACH) * 1.2
		);
		if (reach < PUPIL_RADIUS) return PUPIL_SHADE;
		if (reach < IRIS_RADIUS) closest = Math.min(closest, IRIS_SHADE);
	}
	return closest;
}

export function eyeShadeAt(across: number, up: number, base: number, look: EyeLook): number {
	const aperture = eyeAperturesAt(across, up, look);
	const lidReveal = fadeBetween(LID_HIDES_BELOW, LID_FULLY_SHOWS_AT, look.openness);
	const strength = fadeBetween(APERTURE_OPENS_AT, APERTURE_FULLY_OPEN_AT, aperture) * lidReveal;
	if (strength <= 0) return base;
	return mixTowards(base, shadeWithinEye(across, up, look), strength);
}
