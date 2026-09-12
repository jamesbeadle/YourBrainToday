import { Raycaster, Vector2, type Mesh, type PerspectiveCamera } from 'three';

export type RegionPicker = { pick: (pointerX: number, pointerY: number) => string | null };

export function createRegionPicker(
	camera: PerspectiveCamera,
	canvas: HTMLCanvasElement,
	hitTargetsFor: () => Mesh[]
): RegionPicker {
	const raycaster = new Raycaster();
	const pointer = new Vector2();

	function pick(pointerX: number, pointerY: number): string | null {
		const bounds = canvas.getBoundingClientRect();
		pointer.x = ((pointerX - bounds.left) / bounds.width) * 2 - 1;
		pointer.y = -(((pointerY - bounds.top) / bounds.height) * 2 - 1);
		raycaster.setFromCamera(pointer, camera);
		const [nearest] = raycaster.intersectObjects(hitTargetsFor(), false);
		if (nearest === undefined) return null;
		const regionId = nearest.object.userData.regionId;
		return typeof regionId === 'string' ? regionId : null;
	}

	return { pick };
}
