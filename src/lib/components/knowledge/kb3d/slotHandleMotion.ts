import { MathUtils } from 'three';
import { scaleGroupOpacity } from './groupOpacity';
import { dashboardMotion } from '../dashboard/dashboardMotion';
import type { SlotHandle } from './kbGalaxyAssembly';

const BOB_HEIGHT = 0.3;
const BOB_SPEED = 0.6;
const HOVER_SCALE = 1.14;
const SCALE_EASE = 6;
const OPACITY_EASE = 4;
const SETTLING_SECONDS = 1;

export type SlotMotionState = {
	isAnimated: boolean;
	hoveredSlotId: string | null;
	focusedSlotId: string | null;
};

export function animateSlotHandles(
	handles: SlotHandle[],
	deltaSeconds: number,
	timeSeconds: number,
	state: SlotMotionState
): void {
	for (const handle of handles) {
		if (state.isAnimated) spinAndBob(handle, deltaSeconds, timeSeconds);
		easeScale(handle, deltaSeconds, state.hoveredSlotId);
		easeOpacity(handle, deltaSeconds, state.focusedSlotId, state.isAnimated);
	}
}

/** Lands every eased value at its target at once, for a frame drawn while the loop rests. */
export function settleSlotHandles(handles: SlotHandle[], state: SlotMotionState): void {
	for (const handle of handles) {
		easeScale(handle, SETTLING_SECONDS, state.hoveredSlotId);
		easeOpacity(handle, SETTLING_SECONDS, state.focusedSlotId, state.isAnimated);
	}
}

function spinAndBob(handle: SlotHandle, deltaSeconds: number, timeSeconds: number): void {
	handle.group.rotation.y += deltaSeconds * handle.spinSpeed;
	handle.group.position.y =
		handle.baseY + Math.sin(timeSeconds * BOB_SPEED + handle.bobPhase) * BOB_HEIGHT;
}

function easeScale(handle: SlotHandle, deltaSeconds: number, hoveredSlotId: string | null): void {
	const targetScale = handle.slot.id === hoveredSlotId ? HOVER_SCALE : 1;
	const eased = MathUtils.lerp(handle.group.scale.x, targetScale, Math.min(1, deltaSeconds * SCALE_EASE));
	handle.group.scale.setScalar(eased);
}

function easeOpacity(
	handle: SlotHandle,
	deltaSeconds: number,
	focusedSlotId: string | null,
	isAnimated: boolean
): void {
	const isDimmed = focusedSlotId !== null && handle.slot.id !== focusedSlotId;
	const targetOpacity = isDimmed ? dashboardMotion.dimmedSlotOpacity : 1;
	const eased = isAnimated
		? MathUtils.lerp(handle.opacityScale, targetOpacity, Math.min(1, deltaSeconds * OPACITY_EASE))
		: targetOpacity;
	if (eased === handle.opacityScale) return;
	handle.opacityScale = eased;
	scaleGroupOpacity(handle.group, eased);
}
