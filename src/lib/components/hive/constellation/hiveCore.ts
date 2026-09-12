import { AdditiveBlending, Group, Sprite, SpriteMaterial, type Texture } from 'three';
import { HONEY, HONEY_WHITE } from './hivePalette';

const HALO_SCALE = 7;
const CORE_SCALE = 2.8;
const HALO_OPACITY = 0.4;
const CORE_OPACITY = 0.95;
const BREATH_DEPTH = 0.09;
const BREATH_SPEED = 1.15;

export type HiveCore = {
	group: Group;
	update: (timeSeconds: number) => void;
	dispose: () => void;
};

export function createHiveCore(glowTexture: Texture): HiveCore {
	const group = new Group();
	const haloMaterial = coreMaterial(glowTexture, HONEY, HALO_OPACITY);
	const heartMaterial = coreMaterial(glowTexture, HONEY_WHITE, CORE_OPACITY);
	const halo = new Sprite(haloMaterial);
	const heart = new Sprite(heartMaterial);
	halo.scale.setScalar(HALO_SCALE);
	heart.scale.setScalar(CORE_SCALE);
	group.add(halo, heart);

	function update(timeSeconds: number): void {
		const breath = 1 + Math.sin(timeSeconds * BREATH_SPEED) * BREATH_DEPTH;
		halo.scale.setScalar(HALO_SCALE * breath);
		heart.scale.setScalar(CORE_SCALE * (2 - breath));
	}

	function dispose(): void {
		haloMaterial.dispose();
		heartMaterial.dispose();
	}

	return { group, update, dispose };
}

function coreMaterial(glowTexture: Texture, colour: number, opacity: number): SpriteMaterial {
	return new SpriteMaterial({
		map: glowTexture,
		color: colour,
		transparent: true,
		opacity,
		blending: AdditiveBlending,
		depthWrite: false
	});
}
