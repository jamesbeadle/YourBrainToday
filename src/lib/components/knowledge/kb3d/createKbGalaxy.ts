import { createGalaxyFocus, type FocusOptions } from './kbGalaxyFocus';
import { createGalaxyFraming } from './kbGalaxyFraming';
import { createKbGalaxyScene, type KbGalaxyCallbacks } from './kbGalaxyScene';
import { animateSlotHandles, settleSlotHandles, type SlotMotionState } from './slotHandleMotion';
import { createOrbitRig, prefersReducedMotion } from '../../brain/constellation/orbitRig';
import { createStage, fitStageTo } from '../../stage/createStage';
import { createSceneLoop } from '../../stage/animationLoop';
import type { ConstellationSlot } from '../constellationSlots';

const STAGE_OPTIONS = { fieldOfViewDegrees: 46, farPlane: 160 };

export type KbGalaxyExperience = {
	focusSlot: (slotId: string, options?: FocusOptions) => void;
	releaseFocus: () => void;
	pause: () => void;
	resume: () => void;
	updateSlots: (slots: ConstellationSlot[]) => void;
	destroy: () => void;
};

export function createKbGalaxy(
	canvas: HTMLCanvasElement,
	container: HTMLElement,
	initialSlots: ConstellationSlot[],
	callbacks: KbGalaxyCallbacks
): KbGalaxyExperience {
	const isAnimated = !prefersReducedMotion();
	const stage = createStage(canvas, STAGE_OPTIONS);
	const framing = createGalaxyFraming(stage.camera, container, STAGE_OPTIONS.fieldOfViewDegrees);
	stage.camera.position.copy(framing.restingPosition);
	const controls = createOrbitRig(stage.camera, canvas);
	const focus = createGalaxyFocus(stage.camera, controls, framing.restingPosition, isAnimated);
	const scene = createKbGalaxyScene({ canvas, camera: stage.camera, initialSlots, callbacks });
	const loop = createSceneLoop(frame);
	const resizeObserver = fitStageTo(stage, container, frameToContainer);

	function motionState(): SlotMotionState {
		return { isAnimated, hoveredSlotId: scene.hoveredSlotId(), focusedSlotId: focus.focusedSlotId() };
	}

	function render(): void {
		stage.renderer.render(scene.galaxy().scene, stage.camera);
	}

	function frame(deltaSeconds: number, timeSeconds: number): void {
		focus.update(deltaSeconds);
		controls.update();
		animateSlotHandles(scene.galaxy().handles, deltaSeconds, timeSeconds, motionState());
		render();
	}

	function frameToContainer(): void {
		framing.fit(scene.galaxy().handles, controls.target, focus.focusedSlotId() !== null);
		renderWhileResting();
	}

	function renderWhileResting(): void {
		if (loop.isRunning()) return;
		settleSlotHandles(scene.galaxy().handles, motionState());
		render();
	}

	function focusSlot(slotId: string, options: FocusOptions = {}): void {
		const handle = scene.galaxy().handles.find((candidate) => candidate.slot.id === slotId);
		if (handle === undefined) return;
		focus.focus(handle, options.isInstant ?? false);
	}

	function releaseFocus(): void {
		focus.release(false);
	}

	function updateSlots(slots: ConstellationSlot[]): void {
		if (scene.isShowing(slots)) return;
		const focusedSlotId = focus.focusedSlotId();
		scene.replace(slots);
		focus.release(true);
		if (focusedSlotId !== null) focusSlot(focusedSlotId, { isInstant: true });
		frameToContainer();
	}

	function destroy(): void {
		loop.pause();
		scene.dispose();
		resizeObserver.disconnect();
		controls.dispose();
		stage.dispose();
	}

	return { focusSlot, releaseFocus, pause: loop.pause, resume: loop.resume, updateSlots, destroy };
}
