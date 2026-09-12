import { BoxGeometry, Color, InstancedMesh, Matrix4, MeshLambertMaterial } from 'three';
import { noiseAt } from './gridNoise';
import { CUBE_PITCH } from './reliefPalette';
import { colourForShade } from './reliefShade';

const SPECKLE_COUNT = 12000;
const SPREAD_ACROSS = 4.6;
const SPREAD_UP = 3.4;
const NEAREST_DEPTH = -0.45;
const DEEPEST_DEPTH = -2.4;
const HEAD_PULL = 1.5;
const SMALLEST_SIZE = 0.35;
const LARGEST_SIZE = 0.85;
const DIMMEST_SHADE = 0.46;
const BRIGHTEST_SHADE = 0.96;
const RISE_RATE = 0.035;
const SIDLE_RATE = 0.021;
const SIDLE_REACH = 1.6;

function clusteredTowardsHead(spread: number, sample: number): number {
	const signed = sample * 2 - 1;
	return Math.sign(signed) * Math.pow(Math.abs(signed), HEAD_PULL) * spread;
}

type SpeckleRest = { across: number; up: number };

export type SpeckleField = { mesh: InstancedMesh; drift: (time: number) => void };

export function createSpeckleField(): SpeckleField {
	const material = new MeshLambertMaterial();
	const geometry = new BoxGeometry(CUBE_PITCH, CUBE_PITCH, CUBE_PITCH);
	const mesh = new InstancedMesh(geometry, material, SPECKLE_COUNT);
	const matrix = new Matrix4();
	const colour = new Color();
	const restingPlaces: SpeckleRest[] = [];
	for (let index = 0; index < SPECKLE_COUNT; index += 1) {
		const across = clusteredTowardsHead(SPREAD_ACROSS, noiseAt(index, 1, 11));
		const up = clusteredTowardsHead(SPREAD_UP, noiseAt(index, 2, 13));
		const depth = NEAREST_DEPTH + (DEEPEST_DEPTH - NEAREST_DEPTH) * noiseAt(index, 3, 17);
		const size = SMALLEST_SIZE + (LARGEST_SIZE - SMALLEST_SIZE) * noiseAt(index, 4, 19);
		const shade = DIMMEST_SHADE + (BRIGHTEST_SHADE - DIMMEST_SHADE) * noiseAt(index, 5, 23);
		matrix.makeScale(size, size, size);
		matrix.setPosition(across, up, depth);
		mesh.setMatrixAt(index, matrix);
		mesh.setColorAt(index, colourForShade(shade, colour));
		restingPlaces.push({ across, up });
	}
	mesh.instanceMatrix.needsUpdate = true;
	mesh.frustumCulled = false;
	return { mesh, drift: (time: number) => driftSpeckles(mesh, restingPlaces, time) };
}

const driftMatrix = new Matrix4();

function driftSpeckles(mesh: InstancedMesh, restingPlaces: SpeckleRest[], time: number): void {
	restingPlaces.forEach((restingPlace, index) => {
		mesh.getMatrixAt(index, driftMatrix);
		driftMatrix.elements[12] =
			restingPlace.across + Math.sin(time * SIDLE_RATE + index * SIDLE_REACH) * CUBE_PITCH;
		driftMatrix.elements[13] =
			restingPlace.up + Math.sin(time * RISE_RATE + index) * CUBE_PITCH;
		mesh.setMatrixAt(index, driftMatrix);
	});
	mesh.instanceMatrix.needsUpdate = true;
}
