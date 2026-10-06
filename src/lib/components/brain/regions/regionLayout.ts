import { Vector3 } from 'three';
import { sampleInsideCortex } from '../constellation/brainShape';
import { shareStreamFrom } from '../constellation/pseudoRandom';

const CANDIDATE_COUNT = 420;
const ANCHOR_DEPTH_SHARE = 0.82;
const FIRST_HOME = new Vector3(1.2, 1.2, 2.4);

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
