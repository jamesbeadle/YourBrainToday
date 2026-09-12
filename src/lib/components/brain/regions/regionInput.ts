import { attachConstellationPointer } from '../constellation/constellationPointer';
import { createRegionPicker } from './regionPicker';
import type { Mesh, PerspectiveCamera } from 'three';
import type { RegionDirector } from './regionDirector';
import type { RegionCallbacks } from './regionTypes';

export function attachRegionInput(dependencies: {
	canvas: HTMLCanvasElement;
	camera: PerspectiveCamera;
	hitTargetsFor: () => Mesh[];
	callbacks: RegionCallbacks;
	director: RegionDirector;
}): () => void {
	const { canvas, camera, hitTargetsFor, callbacks, director } = dependencies;
	const picker = createRegionPicker(camera, canvas, hitTargetsFor);

	function hover(pointerX: number, pointerY: number): void {
		const regionId = picker.pick(pointerX, pointerY);
		canvas.style.cursor = regionId === null ? 'grab' : 'pointer';
		director.hoverRegion(regionId);
		if (regionId === null) {
			callbacks.onHover(null);
			return;
		}
		const bounds = canvas.getBoundingClientRect();
		callbacks.onHover({ regionId, x: pointerX - bounds.left, y: pointerY - bounds.top });
	}

	function click(pointerX: number, pointerY: number): void {
		const regionId = picker.pick(pointerX, pointerY);
		callbacks.onHover(null);
		director.focusRegion(regionId);
		callbacks.onSelectRegion(regionId);
	}

	function leave(): void {
		director.hoverRegion(null);
		callbacks.onHover(null);
	}

	return attachConstellationPointer(canvas, { onMove: hover, onClick: click, onLeave: leave });
}
