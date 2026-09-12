import { Vector3, type PerspectiveCamera } from 'three';
import { createCameraFlight } from '../../brain/constellation/cameraFlight';
import { dashboardMotion, flightEasing } from '../dashboard/dashboardMotion';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { SlotHandle } from './kbGalaxyAssembly';

const MILLISECONDS_PER_SECOND = 1000;
const FOCUS_DISTANCE = 6;
const FOCUS_LIFT = 1.2;
const ORIGIN = new Vector3(0, 0, 0);

export type FocusOptions = { isInstant?: boolean };

export type GalaxyFocus = {
	focus: (handle: SlotHandle, isInstant: boolean) => void;
	release: (isInstant: boolean) => void;
	update: (deltaSeconds: number) => void;
	focusedSlotId: () => string | null;
};

/** Flies the camera into one brain and back out to the ring, holding the orbit still while focused. */
export function createGalaxyFocus(
	camera: PerspectiveCamera,
	controls: OrbitControls,
	restingPosition: Vector3,
	isAnimated: boolean
): GalaxyFocus {
	const flight = createCameraFlight(camera, controls.target, {
		seconds: dashboardMotion.flightMilliseconds / MILLISECONDS_PER_SECOND,
		ease: flightEasing
	});
	const restingAutoRotate = controls.autoRotate;
	let focusedSlotId: string | null = null;

	function travel(destination: Vector3, target: Vector3, isInstant: boolean): void {
		if (isInstant || !isAnimated) {
			camera.position.copy(destination);
			controls.target.copy(target);
			return;
		}
		flight.flyTo(destination, target);
	}

	function focus(handle: SlotHandle, isInstant: boolean): void {
		if (focusedSlotId === handle.slot.id) return;
		focusedSlotId = handle.slot.id;
		controls.enabled = false;
		controls.autoRotate = false;
		travel(vantagePointFor(handle), handle.group.position.clone(), isInstant);
	}

	function release(isInstant: boolean): void {
		if (focusedSlotId === null) return;
		focusedSlotId = null;
		controls.enabled = true;
		controls.autoRotate = restingAutoRotate;
		travel(restingPosition, ORIGIN, isInstant);
	}

	function update(deltaSeconds: number): void {
		flight.update(camera, controls.target, deltaSeconds);
	}

	return { focus, release, update, focusedSlotId: () => focusedSlotId };
}

function vantagePointFor(handle: SlotHandle): Vector3 {
	const outward = handle.group.position.clone().setY(0).normalize();
	return handle.group.position
		.clone()
		.addScaledVector(outward, FOCUS_DISTANCE)
		.add(new Vector3(0, FOCUS_LIFT, 0));
}
