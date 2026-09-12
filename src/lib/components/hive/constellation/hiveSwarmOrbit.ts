import {
	AdditiveBlending,
	BufferGeometry,
	Group,
	Line,
	LineBasicMaterial,
	QuadraticBezierCurve3,
	Sprite,
	SpriteMaterial,
	Vector3,
	type Texture
} from 'three';
import { FILAMENT, HONEY_WHITE } from './hivePalette';
import { createHiveSwarmCloud } from './hiveSwarmCloud';
import type { HiveSwarm } from './hiveSwarmModel';

const CORE_SURFACE_RADIUS = 1.2;
const FILAMENT_ARC_LIFT = 1.6;
const FILAMENT_SEGMENTS = 40;
const FILAMENT_OPACITY = 0.16;
const PULSES_PER_FILAMENT = 2;
const PULSE_SCALE = 0.16;
const PULSE_OPACITY = 0.85;

export type HiveSwarmOrbit = {
	group: Group;
	update: (deltaSeconds: number, timeSeconds: number) => void;
	dispose: () => void;
};

export function createHiveSwarmOrbit(swarm: HiveSwarm, glowTexture: Texture): HiveSwarmOrbit {
	const tilt = new Group();
	tilt.rotation.z = swarm.orbitTiltRadians;
	const spinner = new Group();
	spinner.rotation.y = swarm.orbitPhaseRadians;
	tilt.add(spinner);

	const cloud = createHiveSwarmCloud(swarm, glowTexture);
	cloud.group.position.set(swarm.orbitRadius, 0, 0);
	spinner.add(cloud.group);

	const filament = filamentTowardCore(swarm.orbitRadius);
	const filamentMaterial = new LineBasicMaterial({
		color: FILAMENT,
		transparent: true,
		opacity: FILAMENT_OPACITY
	});
	const filamentGeometry = new BufferGeometry().setFromPoints(
		filament.getPoints(FILAMENT_SEGMENTS)
	);
	spinner.add(new Line(filamentGeometry, filamentMaterial));

	const pulseMaterial = new SpriteMaterial({
		map: glowTexture,
		color: HONEY_WHITE,
		transparent: true,
		opacity: PULSE_OPACITY,
		blending: AdditiveBlending,
		depthWrite: false
	});
	const pulses = Array.from({ length: PULSES_PER_FILAMENT }, (unused, pulseIndex) => {
		const sprite = new Sprite(pulseMaterial);
		sprite.scale.setScalar(PULSE_SCALE);
		spinner.add(sprite);
		return { sprite, progress: pulseIndex / PULSES_PER_FILAMENT };
	});

	function update(deltaSeconds: number, timeSeconds: number): void {
		spinner.rotation.y += swarm.orbitSpeedRadiansPerSecond * deltaSeconds;
		cloud.update(timeSeconds);
		for (const pulse of pulses) {
			pulse.progress = (pulse.progress + swarm.pulseSpeed * deltaSeconds) % 1;
			filament.getPoint(pulse.progress, pulse.sprite.position);
		}
	}

	function dispose(): void {
		cloud.dispose();
		filamentGeometry.dispose();
		filamentMaterial.dispose();
		pulseMaterial.dispose();
	}

	return { group: tilt, update, dispose };
}

function filamentTowardCore(orbitRadius: number): QuadraticBezierCurve3 {
	const swarmEdge = new Vector3(orbitRadius, 0, 0);
	const arcApex = new Vector3(orbitRadius / 2, FILAMENT_ARC_LIFT, 0);
	const coreEdge = new Vector3(CORE_SURFACE_RADIUS, 0, 0);
	return new QuadraticBezierCurve3(swarmEdge, arcApex, coreEdge);
}
