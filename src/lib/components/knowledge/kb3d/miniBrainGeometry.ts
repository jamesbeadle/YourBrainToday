import { Vector3 } from 'three';
import { sampleInsideBrain } from '../../brain/constellation/brainShape';
import { shareStreamFrom } from '../../brain/constellation/pseudoRandom';

const NEURON_COUNT = 110;
const BRAIN_SCALE = 0.6;

export function sampleBrainPoints(seedText: string): Vector3[] {
	const nextShare = shareStreamFrom(seedText);
	const samples: Vector3[] = [];
	for (let index = 0; index < NEURON_COUNT; index += 1) {
		samples.push(sampleInsideBrain(nextShare).multiplyScalar(BRAIN_SCALE));
	}
	return samples;
}

export function flattenSamples(samples: Vector3[]): number[] {
	return samples.flatMap((sample) => [sample.x, sample.y, sample.z]);
}

export function linkPositions(samples: Vector3[]): number[] {
	const positions: number[] = [];
	for (let index = 1; index < samples.length; index += 1) {
		const nearest = nearestEarlierSample(samples, index);
		positions.push(...[samples[index], nearest].flatMap((point) => [point.x, point.y, point.z]));
	}
	return positions;
}

function nearestEarlierSample(samples: Vector3[], index: number): Vector3 {
	let nearest = samples[0];
	let nearestDistance = Number.POSITIVE_INFINITY;
	for (let earlier = 0; earlier < index; earlier += 1) {
		const distance = samples[index].distanceToSquared(samples[earlier]);
		if (distance < nearestDistance) {
			nearestDistance = distance;
			nearest = samples[earlier];
		}
	}
	return nearest;
}
