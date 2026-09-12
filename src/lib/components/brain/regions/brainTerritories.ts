import { Vector3 } from 'three';
import { sampleInsideCortex } from '../constellation/brainShape';
import { shareStreamFrom } from '../constellation/pseudoRandom';

const TISSUE_BASE_COUNT = 330;
const TISSUE_PER_EPISODE = 4;
const TISSUE_CAP = 640;
const WEIGHT_PER_EPISODE = 0.22;
const UNFILED_WEIGHT = 0.75;
const EXTENT_SHARE = 1.35;
const CORTEX_FLOOR_SHARE = 0.74;

export type TerritoryClaim = { episodeCount: number; isUnfiled: boolean; anchor: Vector3 };

export type Territory = { centre: Vector3; radius: number; samples: Vector3[] };

export function territoriesFor(claims: TerritoryClaim[], seedText: string): Territory[] {
	if (claims.length === 0) return [];
	const nextShare = shareStreamFrom(`${seedText}:territories`);
	const episodeTotal = claims.reduce((sum, claim) => sum + claim.episodeCount, 0);
	const sampleCount = Math.min(TISSUE_CAP, TISSUE_BASE_COUNT + TISSUE_PER_EPISODE * episodeTotal);
	const weights = claims.map(weightOf);
	const samplesByClaim: Vector3[][] = claims.map(() => []);
	for (let index = 0; index < sampleCount; index += 1) {
		const point = sampleInsideCortex(nextShare, CORTEX_FLOOR_SHARE);
		samplesByClaim[closestClaimIndex(point, claims, weights)].push(point);
	}
	return samplesByClaim.map((samples, index) => territoryOf(samples, claims[index].anchor));
}

function weightOf(claim: TerritoryClaim): number {
	if (claim.isUnfiled) return UNFILED_WEIGHT;
	return 1 + WEIGHT_PER_EPISODE * Math.sqrt(claim.episodeCount);
}

function closestClaimIndex(point: Vector3, claims: TerritoryClaim[], weights: number[]): number {
	let closestIndex = 0;
	let closestPull = Infinity;
	claims.forEach((claim, index) => {
		const pull = claim.anchor.distanceTo(point) / weights[index];
		if (pull >= closestPull) return;
		closestIndex = index;
		closestPull = pull;
	});
	return closestIndex;
}

function territoryOf(samples: Vector3[], anchor: Vector3): Territory {
	if (samples.length === 0) return { centre: anchor.clone(), radius: 0, samples: [] };
	const centre = samples
		.reduce((sum, sample) => sum.add(sample), new Vector3())
		.divideScalar(samples.length);
	const meanSquare =
		samples.reduce((sum, sample) => sum + sample.distanceToSquared(centre), 0) / samples.length;
	const byDistance = samples.toSorted(
		(first, second) => first.distanceTo(centre) - second.distanceTo(centre)
	);
	return { centre, radius: Math.sqrt(meanSquare) * EXTENT_SHARE, samples: byDistance };
}
