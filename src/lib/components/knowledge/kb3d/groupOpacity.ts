import type { Group, Material } from 'three';

type MaterialBearer = { material?: Material };

/** Fades every material in the group as one, remembering each one's own opacity as the full value. */
export function scaleGroupOpacity(group: Group, scale: number): void {
	group.traverse((object) => {
		const material = (object as MaterialBearer).material;
		if (material === undefined) return;
		material.userData.fullOpacity ??= material.opacity;
		material.opacity = material.userData.fullOpacity * scale;
	});
}
