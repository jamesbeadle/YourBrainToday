import { axonPathOf } from '../constellation/axonPath';
import { strandHeadingsOf } from '../constellation/synapseHeadings';
import type { FibrePath } from '../constellation/fibreGeometry';
import type { Synapse } from '../constellation/constellationTypes';
import type { BrainRegion, RegionNeuron } from './regionTypes';

const NEIGHBOUR_LINK_COUNT = 2;
const LONGEST_LINK = 0.36;
const LINK_FIBRE_RADIUS = 0.002;

export type SomaRadiusFor = (neuron: RegionNeuron) => number;

export function localLinksOf(region: BrainRegion, somaRadiusFor: SomaRadiusFor): FibrePath[] {
	const pairs = new Map<string, [RegionNeuron, RegionNeuron]>();
	for (const neuron of region.neurons) {
		for (const neighbour of nearestNeighbours(region.neurons, neuron, LONGEST_LINK)) {
			const key = [neuron.id, neighbour.id].sort().join('~');
			if (!pairs.has(key)) pairs.set(key, [neuron, neighbour]);
		}
	}
	return [...pairs.values()].map(([from, to]) => linkPath(region, from, to, somaRadiusFor));
}

function linkPath(
	region: BrainRegion,
	from: RegionNeuron,
	to: RegionNeuron,
	somaRadiusFor: SomaRadiusFor
): FibrePath {
	const synapse: Synapse = {
		kind: 'dendrite',
		contextSlug: region.id,
		fromSlug: from.id,
		toSlug: to.id,
		from: from.position,
		to: to.position
	};
	return axonPathOf(synapse, strandHeadingsOf(synapse), {
		fromSomaRadius: somaRadiusFor(from),
		toSomaRadius: somaRadiusFor(to),
		fibreRadius: LINK_FIBRE_RADIUS
	});
}

function nearestNeighbours(
	neurons: RegionNeuron[],
	neuron: RegionNeuron,
	longestLink: number
): RegionNeuron[] {
	return neurons
		.filter((candidate) => candidate !== neuron)
		.map((candidate) => ({ candidate, distance: candidate.position.distanceTo(neuron.position) }))
		.filter((entry) => entry.distance <= longestLink)
		.sort((left, right) => left.distance - right.distance)
		.slice(0, NEIGHBOUR_LINK_COUNT)
		.map((entry) => entry.candidate);
}
