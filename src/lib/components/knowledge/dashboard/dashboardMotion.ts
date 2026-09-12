import { prefersReducedMotion } from '../../brain/constellation/orbitRig';
import { cubicOut } from 'svelte/easing';

export const dashboardMotion = {
	flightMilliseconds: 900,
	viewFadeMilliseconds: 260,
	panelSlideMilliseconds: 220,
	scrimFadeMilliseconds: 150,
	prefetchIntentMilliseconds: 120,
	dimmedSlotOpacity: 0.16
} as const;

export const flightEasing = cubicOut;
export const panelEasing = cubicOut;

/** A brain's view fades over the galaxy, or cuts for anyone who prefers reduced motion. */
export function viewFadeMilliseconds(): number {
	return prefersReducedMotion() ? 0 : dashboardMotion.viewFadeMilliseconds;
}
