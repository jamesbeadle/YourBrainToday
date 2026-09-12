import {
	AdditiveBlending,
	BufferGeometry,
	Color,
	Line,
	LineBasicMaterial,
	Sprite,
	SpriteMaterial,
	Vector3,
	type Texture
} from 'three';

export const RING_RADIUS = 7;

export function coreGlow(glowTexture: Texture): Sprite {
	const material = new SpriteMaterial({
		map: glowTexture,
		color: new Color('#eef1f8'),
		transparent: true,
		opacity: 0.8,
		blending: AdditiveBlending,
		depthWrite: false
	});
	const sprite = new Sprite(material);
	sprite.scale.setScalar(1.4);
	return sprite;
}

export function buildSpoke(target: Vector3, accentCss: string, isGhost: boolean) {
	const geometry = new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), target]);
	const material = new LineBasicMaterial({
		color: new Color(accentCss),
		transparent: true,
		opacity: isGhost ? 0.1 : 0.28,
		blending: AdditiveBlending,
		depthWrite: false
	});
	return {
		line: new Line(geometry, material),
		dispose: () => {
			geometry.dispose();
			material.dispose();
		}
	};
}

export function slotPosition(slotIndex: number, slotCount: number): Vector3 {
	const angle = -Math.PI / 2 + (2 * Math.PI * slotIndex) / slotCount;
	const lift = slotIndex % 2 === 0 ? 0.7 : -0.7;
	return new Vector3(RING_RADIUS * Math.cos(angle), lift, RING_RADIUS * Math.sin(angle));
}
