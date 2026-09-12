import {
	AdditiveBlending,
	BufferGeometry,
	Float32BufferAttribute,
	Group,
	Points,
	PointsMaterial,
	type Texture
} from 'three';
import { asCssColour } from '../../brain/constellation/constellationPalette';
import { createTextSprite } from '../../brain/constellation/textSprite';
import type { HiveSwarm } from './hiveSwarmModel';

const PARTICLE_SIZE = 0.22;
const PARTICLE_OPACITY = 0.9;
const FLATTENING = 0.6;
const BUZZ_AMPLITUDE = 0.12;
const SLOWEST_BUZZ_FREQUENCY = 1.4;
const BUZZ_FREQUENCY_SPREAD = 2.2;
const LABEL_LIFT = 0.75;

export type HiveSwarmCloud = {
	group: Group;
	update: (timeSeconds: number) => void;
	dispose: () => void;
};

export function createHiveSwarmCloud(swarm: HiveSwarm, glowTexture: Texture): HiveSwarmCloud {
	const restingPositions: number[] = [];
	const frequencies: number[] = [];
	const phases: number[] = [];
	for (let particleIndex = 0; particleIndex < swarm.particleCount; particleIndex += 1) {
		restingPositions.push(...restingPositionWithin(swarm.buzzRadius));
		frequencies.push(SLOWEST_BUZZ_FREQUENCY + Math.random() * BUZZ_FREQUENCY_SPREAD);
		phases.push(Math.random() * Math.PI * 2);
	}

	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new Float32BufferAttribute([...restingPositions], 3));
	const material = new PointsMaterial({
		map: glowTexture,
		color: swarm.colour,
		size: PARTICLE_SIZE,
		transparent: true,
		opacity: PARTICLE_OPACITY,
		blending: AdditiveBlending,
		depthWrite: false
	});

	const group = new Group();
	group.add(new Points(geometry, material));
	const label = createTextSprite(swarm.member.specialtyName.toUpperCase(), asCssColour(swarm.colour));
	label.position.set(0, swarm.buzzRadius + LABEL_LIFT, 0);
	group.add(label);

	function update(timeSeconds: number): void {
		const positions = geometry.attributes.position;
		for (let particleIndex = 0; particleIndex < swarm.particleCount; particleIndex += 1) {
			const restingIndex = particleIndex * 3;
			const angle = timeSeconds * frequencies[particleIndex] + phases[particleIndex];
			positions.setXYZ(
				particleIndex,
				restingPositions[restingIndex] + Math.sin(angle) * BUZZ_AMPLITUDE,
				restingPositions[restingIndex + 1] + Math.sin(angle * 1.7) * BUZZ_AMPLITUDE * FLATTENING,
				restingPositions[restingIndex + 2] + Math.cos(angle) * BUZZ_AMPLITUDE
			);
		}
		positions.needsUpdate = true;
	}

	function dispose(): void {
		geometry.dispose();
		material.dispose();
		label.material.map?.dispose();
		label.material.dispose();
	}

	return { group, update, dispose };
}

function restingPositionWithin(buzzRadius: number): [number, number, number] {
	const azimuth = Math.random() * Math.PI * 2;
	const altitude = Math.acos(2 * Math.random() - 1);
	const radius = buzzRadius * Math.cbrt(Math.random());
	return [
		radius * Math.sin(altitude) * Math.cos(azimuth),
		radius * Math.cos(altitude) * FLATTENING,
		radius * Math.sin(altitude) * Math.sin(azimuth)
	];
}
