import { attachConstellationPointer } from '../constellation/constellationPointer';
import { createFlowPicker } from './flowPicker';
import type { Mesh, PerspectiveCamera } from 'three';
import type { FlowDirector } from './flowDirector';
import type { FlowCallbacks } from './flowTypes';

export function attachFlowInput(dependencies: {
	canvas: HTMLCanvasElement;
	camera: PerspectiveCamera;
	hitTargetsFor: () => Mesh[];
	callbacks: FlowCallbacks;
	director: FlowDirector;
}): () => void {
	const { canvas, camera, hitTargetsFor, callbacks, director } = dependencies;
	const picker = createFlowPicker(camera, canvas, hitTargetsFor);

	function hover(pointerX: number, pointerY: number): void {
		const picked = picker.pick(pointerX, pointerY);
		canvas.style.cursor = picked === null ? 'grab' : 'pointer';
		director.hover(picked);
		if (picked === null) {
			callbacks.onHover(null);
			return;
		}
		const bounds = canvas.getBoundingClientRect();
		callbacks.onHover({ ...picked, x: pointerX - bounds.left, y: pointerY - bounds.top });
	}

	function click(pointerX: number, pointerY: number): void {
		const picked = picker.pick(pointerX, pointerY);
		callbacks.onHover(null);
		if (picked?.edgeId !== undefined) return;
		director.focusNode(picked?.nodeId ?? null);
		callbacks.onSelectNode(picked?.nodeId ?? null);
	}

	function leave(): void {
		director.hover(null);
		callbacks.onHover(null);
	}

	return attachConstellationPointer(canvas, { onMove: hover, onClick: click, onLeave: leave });
}
