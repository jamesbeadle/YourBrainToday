import { AdditiveBlending, Sprite, SpriteMaterial, Vector3, type Texture } from 'three';
import { createTextSprite } from '../constellation/textSprite';
import { asCssColour, CHALK } from '../constellation/constellationPalette';
import type { BrainRegion } from './regionTypes';

const HALO_SCALE_SHARE = 2.6;
const HALO_LIFT_SHARE = 0.4;
const IDLE_HALO_OPACITY = 0.12;
const LIT_HALO_OPACITY = 0.36;
const IDLE_LABEL_OPACITY = 0.5;
const CROWD_FADE_SHARE = 0.5;
const LABEL_LIFT = 0.3;
const LABEL_SCREEN_HEIGHT = 0.024;

export type RegionHalo = {
	halo: Sprite;
	label: Sprite;
	light: (excitement: number, crowdDim: number) => void;
	dispose: () => void;
};

export function createRegionHalo(region: BrainRegion, glowTexture: Texture): RegionHalo {
	const haloMaterial = new SpriteMaterial({
		map: glowTexture,
		color: region.colour,
		transparent: true,
		opacity: IDLE_HALO_OPACITY,
		blending: AdditiveBlending,
		depthWrite: false
	});
	const halo = new Sprite(haloMaterial);
	halo.position.copy(region.centre);
	halo.scale.setScalar(region.radius * HALO_SCALE_SHARE);

	const label = createTextSprite(region.name.toUpperCase(), asCssColour(CHALK), LABEL_SCREEN_HEIGHT);
	label.position.copy(region.centre).add(new Vector3(0, LABEL_LIFT, 0));
	label.material.opacity = IDLE_LABEL_OPACITY;

	function light(excitement: number, crowdDim: number): void {
		const crowdShare = 1 - CROWD_FADE_SHARE * crowdDim;
		haloMaterial.opacity =
			IDLE_HALO_OPACITY * crowdShare + (LIT_HALO_OPACITY - IDLE_HALO_OPACITY) * excitement;
		halo.scale.setScalar(region.radius * HALO_SCALE_SHARE * (1 + HALO_LIFT_SHARE * excitement));
		label.material.opacity =
			IDLE_LABEL_OPACITY * crowdShare + (1 - IDLE_LABEL_OPACITY) * excitement;
	}

	function dispose(): void {
		haloMaterial.dispose();
		label.material.map?.dispose();
		label.material.dispose();
	}

	return { halo, label, light, dispose };
}
