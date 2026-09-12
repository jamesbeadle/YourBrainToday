import { AdditiveBlending, Group, Sprite, SpriteMaterial, type Texture } from 'three';
import { createTextSprite } from '../constellation/textSprite';
import { asCssColour } from '../constellation/constellationPalette';
import type { FlowLane } from './flowTypes';

const HAZE_FRONT_Z = 2.6;
const HAZE_BACK_Z = -2.6;
const HAZE_COUNT_PER_LANE = 6;
const HAZE_SCALE = 1.7;
const HAZE_OPACITY = 0.045;
const LABEL_Z = -5.3;
const LABEL_OPACITY = 0.55;
const LABEL_SCREEN_HEIGHT = 0.026;

export type LaneDressing = { group: Group; dispose: () => void };

export function createLaneDressing(lanes: FlowLane[], glowTexture: Texture): LaneDressing {
	const group = new Group();
	const disposers = lanes.flatMap((lane) => [
		dressWithHaze(group, lane, glowTexture),
		dressWithLabel(group, lane)
	]);
	return { group, dispose: () => disposers.forEach((dispose) => dispose()) };
}

function dressWithHaze(group: Group, lane: FlowLane, glowTexture: Texture): () => void {
	const material = new SpriteMaterial({
		map: glowTexture,
		color: lane.colour,
		transparent: true,
		opacity: HAZE_OPACITY,
		blending: AdditiveBlending,
		depthWrite: false
	});
	for (let index = 0; index < HAZE_COUNT_PER_LANE; index += 1) {
		const share = index / (HAZE_COUNT_PER_LANE - 1);
		const sprite = new Sprite(material);
		sprite.position.set(0, lane.laneHeight, HAZE_FRONT_Z + (HAZE_BACK_Z - HAZE_FRONT_Z) * share);
		sprite.scale.setScalar(HAZE_SCALE);
		group.add(sprite);
	}
	return () => material.dispose();
}

function dressWithLabel(group: Group, lane: FlowLane): () => void {
	const label = createTextSprite(lane.name.toUpperCase(), asCssColour(lane.colour), LABEL_SCREEN_HEIGHT);
	label.position.set(0, lane.laneHeight, LABEL_Z);
	label.material.opacity = LABEL_OPACITY;
	group.add(label);
	return () => {
		label.material.map?.dispose();
		label.material.dispose();
	};
}
