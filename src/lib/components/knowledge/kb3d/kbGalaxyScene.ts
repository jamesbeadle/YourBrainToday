import { assembleKbGalaxy, type KbGalaxy } from './kbGalaxyAssembly';
import { attachKbGalaxyInput, type KbGalaxyInput } from './kbGalaxyInput';
import type { Camera } from 'three';
import { areSameSlotsToShow, type ConstellationSlot } from '../constellationSlots';

export type KbGalaxyCallbacks = {
	onHover: (slot: ConstellationSlot | null) => void;
	onActivate: (slot: ConstellationSlot) => void;
};

export type KbGalaxyScene = {
	galaxy: () => KbGalaxy;
	hoveredSlotId: () => string | null;
	isShowing: (slots: ConstellationSlot[]) => boolean;
	replace: (slots: ConstellationSlot[]) => void;
	dispose: () => void;
};

/** The assembled galaxy and its pointer input, rebuilt together whenever the slots change. */
export function createKbGalaxyScene(options: {
	canvas: HTMLCanvasElement;
	camera: Camera;
	initialSlots: ConstellationSlot[];
	callbacks: KbGalaxyCallbacks;
}): KbGalaxyScene {
	let galaxy = assembleKbGalaxy(options.initialSlots);
	let hoveredSlotId: string | null = null;
	let input = attachInput();

	function attachInput(): KbGalaxyInput {
		return attachKbGalaxyInput({
			canvas: options.canvas,
			camera: options.camera,
			handles: galaxy.handles,
			onHover: (slot) => {
				hoveredSlotId = slot?.id ?? null;
				options.callbacks.onHover(slot);
			},
			onActivate: options.callbacks.onActivate
		});
	}

	function dispose(): void {
		input.detach();
		galaxy.dispose();
	}

	function isShowing(slots: ConstellationSlot[]): boolean {
		const shownSlots = galaxy.handles.map((handle) => handle.slot);
		return areSameSlotsToShow(shownSlots, slots);
	}

	function replace(slots: ConstellationSlot[]): void {
		dispose();
		galaxy = assembleKbGalaxy(slots);
		input = attachInput();
	}

	return { galaxy: () => galaxy, hoveredSlotId: () => hoveredSlotId, isShowing, replace, dispose };
}
