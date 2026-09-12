import {
	Euler,
	InstancedMesh,
	Matrix4,
	Quaternion,
	Vector3,
	type BufferGeometry,
	type Points,
	type Texture
} from 'three';
import { pseudoRandomFrom, shareStreamFrom } from '../constellation/pseudoRandom';
import { createTissueGlow } from './tissueGlow';
import type { CellMaterialBank } from '../constellation/cellMaterialBank';
import type { BrainRegion, RegionNeuron } from './regionTypes';

const EPISODE_SOMA_RADIUS = 0.022;
const TISSUE_SOMA_RADIUS = 0.009;
const SOMA_SIZE_SPREAD = 0.3;
const FULL_TURN_RADIANS = Math.PI * 2;

export type TissueCloud = {
	somas: InstancedMesh;
	glows: Points[];
	somaRadiusFor: (neuron: RegionNeuron) => number;
	light: (excitement: number, crowdDim: number, timeSeconds: number) => void;
	dispose: () => void;
};

export function createTissueCloud(
	region: BrainRegion,
	somaGeometry: BufferGeometry,
	glowTexture: Texture,
	cells: CellMaterialBank
): TissueCloud {
	const somaMaterial = cells.somaFor(region.colour, region.id);
	const somas = new InstancedMesh(somaGeometry, somaMaterial, region.neurons.length);
	const nextShare = shareStreamFrom(`${region.id}:spin`);
	const placement = new Matrix4();
	const spin = new Quaternion();
	const size = new Vector3();
	region.neurons.forEach((neuron, index) => {
		const turn = () => nextShare() * FULL_TURN_RADIANS;
		spin.setFromEuler(new Euler(turn(), turn(), turn()));
		placement.compose(neuron.position, spin, size.setScalar(somaRadiusFor(neuron)));
		somas.setMatrixAt(index, placement);
	});
	somas.instanceMatrix.needsUpdate = true;
	somas.computeBoundingSphere();
	const glow = createTissueGlow(region, glowTexture);

	function dispose(): void {
		somas.dispose();
		glow.dispose();
	}

	return { somas, glows: glow.layers, somaRadiusFor, light: glow.light, dispose };
}

export function somaRadiusFor(neuron: RegionNeuron): number {
	const base = neuron.isEpisode ? EPISODE_SOMA_RADIUS : TISSUE_SOMA_RADIUS;
	return base * (1 - SOMA_SIZE_SPREAD / 2 + SOMA_SIZE_SPREAD * pseudoRandomFrom(neuron.id));
}
