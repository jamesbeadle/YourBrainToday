import { Raycaster, Vector2, type Camera, type Mesh } from 'three';
import type { ConstellationSlot } from '../constellationSlots';
import type { SlotHandle } from './kbGalaxyAssembly';

const CLICK_DRIFT_LIMIT_PIXELS = 6;

export type KbGalaxyInput = { detach: () => void };

export function attachKbGalaxyInput(options: {
	canvas: HTMLCanvasElement;
	camera: Camera;
	handles: SlotHandle[];
	onHover: (slot: ConstellationSlot | null) => void;
	onActivate: (slot: ConstellationSlot) => void;
}): KbGalaxyInput {
	const raycaster = new Raycaster();
	const pointer = new Vector2();
	let pressPoint: { x: number; y: number } | null = null;

	function handleFor(mesh: Mesh): SlotHandle | null {
		return options.handles.find((handle) => handle.hitMesh === mesh) ?? null;
	}

	function slotUnderPointer(event: PointerEvent | MouseEvent): ConstellationSlot | null {
		const bounds = options.canvas.getBoundingClientRect();
		pointer.set(
			((event.clientX - bounds.left) / bounds.width) * 2 - 1,
			-((event.clientY - bounds.top) / bounds.height) * 2 + 1
		);
		raycaster.setFromCamera(pointer, options.camera);
		const meshes = options.handles.map((handle) => handle.hitMesh);
		const hit = raycaster.intersectObjects(meshes, false)[0];
		if (hit === undefined) return null;
		return handleFor(hit.object as Mesh)?.slot ?? null;
	}

	function onPointerMove(event: PointerEvent): void {
		const slot = slotUnderPointer(event);
		options.canvas.style.cursor = slot === null ? 'grab' : 'pointer';
		options.onHover(slot);
	}

	function onPointerDown(event: PointerEvent): void {
		pressPoint = { x: event.clientX, y: event.clientY };
	}

	function settleHoverAfterTouch(event: PointerEvent): void {
		if (event.pointerType === 'mouse') return;
		options.onHover(null);
	}

	function onClick(event: MouseEvent): void {
		if (pressPoint === null) return;
		const drift = Math.hypot(event.clientX - pressPoint.x, event.clientY - pressPoint.y);
		pressPoint = null;
		if (drift > CLICK_DRIFT_LIMIT_PIXELS) return;
		const slot = slotUnderPointer(event);
		if (slot !== null) options.onActivate(slot);
	}

	options.canvas.addEventListener('pointermove', onPointerMove);
	options.canvas.addEventListener('pointerdown', onPointerDown);
	options.canvas.addEventListener('pointerup', settleHoverAfterTouch);
	options.canvas.addEventListener('click', onClick);

	return {
		detach: () => {
			options.canvas.removeEventListener('pointermove', onPointerMove);
			options.canvas.removeEventListener('pointerdown', onPointerDown);
			options.canvas.removeEventListener('pointerup', settleHoverAfterTouch);
			options.canvas.removeEventListener('click', onClick);
		}
	};
}
