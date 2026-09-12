import { MathUtils, Vector3, type PerspectiveCamera } from 'three';
import { RING_RADIUS } from './kbGalaxyParts';
import type { SlotHandle } from './kbGalaxyAssembly';

const RESTING_VANTAGE = new Vector3(0, 6, 19);
const RING_MARGIN = 1.8;
const labelScaleBreakpoints = [
	{ belowWidthPixels: 480, scale: 0.7 },
	{ belowWidthPixels: 768, scale: 0.85 }
];

export type GalaxyFraming = {
	restingPosition: Vector3;
	fit: (handles: SlotHandle[], target: Vector3, isFocused: boolean) => void;
};

/**
 * Frames the ring to its container: the camera rests far enough back for the
 * whole ring to fit across the viewport (further in portrait) and the labels
 * shrink on narrow screens.
 */
export function createGalaxyFraming(
	camera: PerspectiveCamera,
	container: HTMLElement,
	fieldOfViewDegrees: number
): GalaxyFraming {
	const restingPosition = RESTING_VANTAGE.clone();

	function fit(handles: SlotHandle[], target: Vector3, isFocused: boolean): void {
		restingPosition.copy(restingPositionFor(camera.aspect, fieldOfViewDegrees));
		scaleLabels(handles, labelScaleFor(container.clientWidth));
		if (isFocused) return;
		keepCameraAtRestingDistance(camera, target, restingPosition);
	}

	return { restingPosition, fit };
}

function restingPositionFor(aspect: number, fieldOfViewDegrees: number): Vector3 {
	const halfHeightPerUnitDistance = Math.tan(MathUtils.degToRad(fieldOfViewDegrees / 2));
	const halfWidthPerUnitDistance = halfHeightPerUnitDistance * Math.min(1, aspect);
	const distanceToFitRing = (RING_RADIUS + RING_MARGIN) / halfWidthPerUnitDistance;
	const distance = Math.max(RESTING_VANTAGE.length(), distanceToFitRing);
	return RESTING_VANTAGE.clone().setLength(distance);
}

function keepCameraAtRestingDistance(
	camera: PerspectiveCamera,
	target: Vector3,
	restingPosition: Vector3
): void {
	const bearing = camera.position.clone().sub(target).setLength(restingPosition.length());
	camera.position.copy(target).add(bearing);
}

export function labelScaleFor(widthPixels: number): number {
	const breakpoint = labelScaleBreakpoints.find((candidate) => widthPixels < candidate.belowWidthPixels);
	return breakpoint?.scale ?? 1;
}

function scaleLabels(handles: SlotHandle[], scale: number): void {
	for (const handle of handles) {
		for (const label of handle.labels) {
			label.userData.fullScale ??= label.scale.clone();
			label.scale.copy(label.userData.fullScale).multiplyScalar(scale);
		}
	}
}
