import { Vector3 } from 'three';
import { sampleInsideCortex } from '../constellation/brainShape';
import { shareStreamFrom } from '../constellation/pseudoRandom';

const CANDIDATE_COUNT = 420;
const ANCHOR_DEPTH_SHARE = 0.82;
const FIRST_HOME = new Vector3(1.2, 1.2, 2.4);
const SMALLEST_RADIUS = 0.55;
const RADIUS_PER_NEURON = 0.13;
const LARGEST_RADIUS = 1.5;

export function regionCentresFor(regionCount: number, seedText: string): Vector3[] {
	const nextShare = shareStreamFrom(`${seedText}:regions`);
	const candidates = Array.from({ length: CANDIDATE_COUNT }, () =>
		sampleInsideCortex(nextShare, ANCHOR_DEPTH_SHARE)
	);
	const centres: Vector3[] = [];
	while (centres.length < regionCount) {
		centres.push(nextCentre(candidates, centres));
	}
	return centres;
}

export function regionRadiusFor(neuronCount: number): number {
	return Math.min(LARGEST_RADIUS, SMALLEST_RADIUS + RADIUS_PER_NEURON * Math.sqrt(neuronCount));
}

function nextCentre(candidates: Vector3[], centres: Vector3[]): Vector3 {
	if (centres.length === 0) return nearestTo(candidates, FIRST_HOME);
	let farthest = candidates[0];
	let farthestClearance = -1;
	for (const candidate of candidates) {
		const clearance = Math.min(...centres.map((centre) => centre.distanceTo(candidate)));
		if (clearance <= farthestClearance) continue;
		farthest = candidate;
		farthestClearance = clearance;
	}
	return farthest.clone();
}

function nearestTo(candidates: Vector3[], home: Vector3): Vector3 {
	let nearest = candidates[0];
	for (const candidate of candidates) {
		if (candidate.distanceTo(home) < nearest.distanceTo(home)) nearest = candidate;
	}
	return nearest.clone();
}
