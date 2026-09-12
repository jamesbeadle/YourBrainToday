import { Raycaster, Vector2, type Mesh, type PerspectiveCamera } from 'three';
import type { FlowHover } from './flowTypes';

export type FlowPick = Pick<FlowHover, 'nodeId' | 'edgeId'>;

export type FlowPicker = { pick: (pointerX: number, pointerY: number) => FlowPick | null };

export function createFlowPicker(
	camera: PerspectiveCamera,
	canvas: HTMLCanvasElement,
	hitTargetsFor: () => Mesh[]
): FlowPicker {
	const raycaster = new Raycaster();
	const pointer = new Vector2();

	function pick(pointerX: number, pointerY: number): FlowPick | null {
		const bounds = canvas.getBoundingClientRect();
		pointer.x = ((pointerX - bounds.left) / bounds.width) * 2 - 1;
		pointer.y = -(((pointerY - bounds.top) / bounds.height) * 2 - 1);
		raycaster.setFromCamera(pointer, camera);
		const [nearest] = raycaster.intersectObjects(hitTargetsFor(), false);
		if (nearest === undefined) return null;
		const { nodeId, edgeId } = nearest.object.userData;
		if (typeof nodeId === 'string') return { nodeId };
		if (typeof edgeId === 'string') return { edgeId };
		return null;
	}

	return { pick };
}
