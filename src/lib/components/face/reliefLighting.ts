import { AmbientLight, DirectionalLight, Group } from 'three';

const AMBIENT_COLOUR = 0xdce8f0;
const AMBIENT_STRENGTH = 0.8;
const KEY_COLOUR = 0xffffff;
const KEY_STRENGTH = 2.8;
const KEY_DIRECTION = { x: -0.7, y: 0.95, z: 1.25 };
const FILL_COLOUR = 0x9fc3de;
const FILL_STRENGTH = 0.9;
const FILL_DIRECTION = { x: 1.1, y: -0.35, z: 0.7 };
const RIM_COLOUR = 0xe8f2f8;
const RIM_STRENGTH = 0.55;
const RIM_DIRECTION = { x: 0.25, y: 0.4, z: -1 };

function directionalLight(
	colour: number,
	strength: number,
	direction: { x: number; y: number; z: number }
): DirectionalLight {
	const light = new DirectionalLight(colour, strength);
	light.position.set(direction.x, direction.y, direction.z);
	return light;
}

export function createReliefLighting(): Group {
	const lighting = new Group();
	lighting.add(
		new AmbientLight(AMBIENT_COLOUR, AMBIENT_STRENGTH),
		directionalLight(KEY_COLOUR, KEY_STRENGTH, KEY_DIRECTION),
		directionalLight(FILL_COLOUR, FILL_STRENGTH, FILL_DIRECTION),
		directionalLight(RIM_COLOUR, RIM_STRENGTH, RIM_DIRECTION)
	);
	return lighting;
}
