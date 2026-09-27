import { harvestDocumentPeople } from './harvestDocumentPeople';
import { fileHumanNetwork } from '$lib/server/knowledge/humanWriter';
import { findBrainFiling } from '$lib/server/knowledge/findBrainFiling';
import { getKnownPeopleNames } from '$lib/server/knowledge/getKnownPeopleNames';
import { findOrCreateHarvestBrain } from '$lib/server/agent/harvestBrains';
import { harvestCreditsFor } from '$lib/data/creditPricing';
import { spendCredits } from '$lib/server/credits/spendCredits';
import type { StoredBrainSource } from './findBrainSource';
import type { SupabaseClient } from '@supabase/supabase-js';

export type PeopleHarvest = {
	connectionCount: number;
	personCount: number;
	outcome: 'filed' | 'unfiled' | 'failed';
};

const nothingFiled = { connectionCount: 0, personCount: 0 };

export async function harvestSourcePeople(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	contentBlock: unknown
): Promise<PeopleHarvest> {
	const filing = await findBrainFiling(supabase, source.brainId);
	if (filing === null) return { ...nothingFiled, outcome: 'unfiled' };
	try {
		return await fileDocumentPeople(supabase, source, contentBlock, filing);
	} catch (failure) {
		console.error('People harvest failed', source.filename, failure);
		return { ...nothingFiled, outcome: 'failed' };
	}
}

export function peopleLogLine(harvest: PeopleHarvest): string {
	if (harvest.outcome === 'unfiled') return '';
	if (harvest.outcome === 'failed') return ' People harvest failed — re-read to try again.';
	if (harvest.personCount === 0) return ' Nobody to add to the human brain.';
	const people = harvest.personCount === 1 ? 'person' : 'people';
	const connections = harvest.connectionCount === 1 ? 'connection' : 'connections';
	return ` Met ${harvest.personCount} ${people} and ${harvest.connectionCount} ${connections} for the human brain.`;
}

async function fileDocumentPeople(
	supabase: SupabaseClient,
	source: StoredBrainSource,
	contentBlock: unknown,
	filing: { knowledgeBaseId: string; knowledgeBaseName: string }
): Promise<PeopleHarvest> {
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
	const peopleBrainId = await findOrCreateHarvestBrain(
		supabase,
		filing.knowledgeBaseId,
		'people_graph'
	);
	await fileHumanNetwork(supabase, peopleBrainId, network, source.filename);
	await spendCredits(
		supabase,
		harvestCreditsFor(harvest.personCount + harvest.connectionCount),
		'knowledge_harvest'
	);
	return harvest;
}
