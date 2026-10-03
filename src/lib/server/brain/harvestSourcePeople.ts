import { harvestDocumentPeople } from './harvestDocumentPeople';
import { fileHumanNetwork } from '$lib/server/knowledge/humanWriter';
import { findBrainFiling } from '$lib/server/knowledge/findBrainFiling';
import { getKnownPeopleNames } from '$lib/server/knowledge/getKnownPeopleNames';
import { findOrCreateHarvestBrain } from '$lib/server/agent/harvestBrains';
import type { StoredBrainSource } from './findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export type PeopleHarvest = {
	connectionCount: number;
	personCount: number;
	outcome: 'filed' | 'unfiled';
};

/** The people the source mentions and how they stand with each other, added to the human brain. */
export async function harvestSourcePeople(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	contentBlock: unknown
): Promise<PeopleHarvest> {
	const filing = await findBrainFiling(supabase, source.brainId);
	if (filing === null) return { connectionCount: 0, personCount: 0, outcome: 'unfiled' };
	const knownPeople = await getKnownPeopleNames(supabase, filing.knowledgeBaseId);
	const network = await harvestDocumentPeople(
		contentBlock,
		source.filename,
		filing.knowledgeBaseName,
		knownPeople
	);
	const harvest = {
		personCount: network.people.length,
		connectionCount: network.connections.length,
		outcome: 'filed' as const
	};
	if (harvest.personCount + harvest.connectionCount === 0) return harvest;
	const peopleBrainId = await findOrCreateHarvestBrain(supabase, filing.knowledgeBaseId, 'people_graph');
	await fileHumanNetwork(supabase, peopleBrainId, network, {
		label: source.filename,
		sourceId: source.id
	});
	return harvest;
}

export function peopleLogLine(harvest: PeopleHarvest): string {
	if (harvest.outcome === 'unfiled') return '';
	if (harvest.personCount === 0) return ' Nobody to add to the human brain.';
	const people = harvest.personCount === 1 ? 'person' : 'people';
	const connections = harvest.connectionCount === 1 ? 'connection' : 'connections';
	return ` Met ${harvest.personCount} ${people} and ${harvest.connectionCount} ${connections} for the human brain.`;
}
