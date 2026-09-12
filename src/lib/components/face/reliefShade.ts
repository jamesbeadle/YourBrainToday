import { Color } from 'three';
import { ReliefPalette } from './reliefPalette';
import { mixTowards } from './reliefShapes';

const SHALLOWEST_DEPTH = 0.36;
const DEEPEST_DEPTH = 1.0;
const BRIGHTNESS_CURVE = 0.52;
const OCCLUSION_BITE = 0.9;
const STACK_DARKENING = 0.3;
const MID_STOP = 0.6;

const deepShadow = new Color(ReliefPalette.deepShadow);
const midTone = new Color(ReliefPalette.midTone);
const highlight = new Color(ReliefPalette.highlight);

export function shadeFor(depth: number, occlusion: number, stackIndex: number): number {
	const lift = (depth - SHALLOWEST_DEPTH) / (DEEPEST_DEPTH - SHALLOWEST_DEPTH);
	const raw = Math.pow(Math.max(0, Math.min(1, lift)), BRIGHTNESS_CURVE);
	const shadowed = raw * (1 - occlusion * OCCLUSION_BITE);
	return Math.max(0, shadowed * (1 - stackIndex * STACK_DARKENING));
}

export function loosenedShade(shade: number, dissolve: number, drifted: number): number {
	return mixTowards(shade, drifted, dissolve);
}

export function colourForShade(shade: number, target: Color): Color {
	if (shade <= MID_STOP) return target.copy(deepShadow).lerp(midTone, shade / MID_STOP);
	return target.copy(midTone).lerp(highlight, (shade - MID_STOP) / (1 - MID_STOP));
}
