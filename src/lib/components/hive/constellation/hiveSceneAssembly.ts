import { Color, Scene } from 'three';
import { NIGHT_SKY } from '../../brain/constellation/constellationPalette';
import { createGlowTexture } from '../../brain/constellation/glowTexture';
import { createHiveCore } from './hiveCore';
import { createHiveSwarmOrbit } from './hiveSwarmOrbit';
import { createStarBackdrop } from '../../brain/constellation/starBackdrop';
import type { HiveSwarm } from './hiveSwarmModel';

export type HiveScene = {
	scene: Scene;
	update: (deltaSeconds: number, timeSeconds: number) => void;
	dispose: () => void;
};

export function assembleHiveScene(swarms: HiveSwarm[]): HiveScene {
	const scene = new Scene();
	scene.background = new Color(NIGHT_SKY);

	const glowTexture = createGlowTexture();
	const backdrop = createStarBackdrop();
	const core = createHiveCore(glowTexture);
	const orbits = swarms.map((swarm) => createHiveSwarmOrbit(swarm, glowTexture));
	scene.add(backdrop.points, core.group, ...orbits.map((orbit) => orbit.group));

	function update(deltaSeconds: number, timeSeconds: number): void {
		core.update(timeSeconds);
		for (const orbit of orbits) {
			orbit.update(deltaSeconds, timeSeconds);
		}
	}

	function dispose(): void {
		backdrop.dispose();
		core.dispose();
		for (const orbit of orbits) {
			orbit.dispose();
		}
		glowTexture.dispose();
	}

	return { scene, update, dispose };
}
