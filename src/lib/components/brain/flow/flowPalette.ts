import { CHALK, SIGNAL } from '../constellation/constellationPalette';
import { sectionHueAt } from '../regions/regionPalette';

export const SOURCE_TINT = CHALK;
export const SINK_TINT = 0xffc861;
export const GAP_TINT = SIGNAL;
export const SYNAPSE_TINT = CHALK;

export function laneHueAt(roleIndex: number): number {
	return sectionHueAt(roleIndex);
}
