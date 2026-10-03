import { createBrainItem } from './createBrainItem';
import { provenanceData, statedProvenance, type SourceProvenance } from './sourceProvenance';
import {
	getHumanItems,
	nameKey,
	saveConnectionFeeling,
	type IndexedHumanItem
} from './humanItemIndex';
import { humanItemKinds } from '$lib/data/knowledge/humanConnections';
import type { HarvestedConnection, HarvestedPerson } from '$lib/server/agent/parseHumanHarvest';
import type { SupabaseClient } from '@supabase/supabase-js';

export type HumanNetwork = { people: HarvestedPerson[]; connections: HarvestedConnection[] };

/** People are known by name; a relationship stated again takes its latest warmth rather than piling up. */
export async function fileHumanNetwork(
	supabase: SupabaseClient,
	brainId: string,
	network: HumanNetwork,
	provenance: SourceProvenance = statedProvenance
): Promise<void> {
	const knownPeople = await knownPeopleIn(supabase, brainId);
	for (const person of network.people) {
		await ensurePerson(supabase, brainId, knownPeople, person, provenance);
	}
	const knownConnections = await getHumanItems(supabase, brainId, humanItemKinds.connection);
	for (const connection of network.connections) {
		await ensurePerson(
			supabase,
			brainId,
			knownPeople,
			personNamedOnly(connection.from),
			provenance
		);
		await ensurePerson(supabase, brainId, knownPeople, personNamedOnly(connection.to), provenance);
		await fileConnection(supabase, brainId, knownConnections, connection, provenance);
	}
}

async function knownPeopleIn(supabase: SupabaseClient, brainId: string): Promise<Set<string>> {
	const people = await getHumanItems(supabase, brainId, humanItemKinds.person);
	return new Set(people.map((person) => nameKey(person.title)));
}

function personNamedOnly(name: string): HarvestedPerson {
	return { name, role: '', organisation: '', note: '' };
}

async function ensurePerson(
	supabase: SupabaseClient,
	brainId: string,
	knownPeople: Set<string>,
	person: HarvestedPerson,
	provenance: SourceProvenance
): Promise<void> {
	if (knownPeople.has(nameKey(person.name))) return;
	await createBrainItem(supabase, {
		brainId,
		itemKind: humanItemKinds.person,
		title: person.name,
		body: person.note,
		data: { role: person.role, organisation: person.organisation, ...provenanceData(provenance) }
	});
	knownPeople.add(nameKey(person.name));
}

async function fileConnection(
	supabase: SupabaseClient,
	brainId: string,
	knownConnections: IndexedHumanItem[],
	connection: HarvestedConnection,
	provenance: SourceProvenance
): Promise<void> {
	const existing = knownConnections.find((known) => isSameConnection(known, connection));
	if (existing !== undefined) {
		await saveConnectionFeeling(supabase, existing, connection);
		return;
	}
	const data = {
		from: connection.from,
		to: connection.to,
		warmth: connection.warmth,
		...provenanceData(provenance)
	};
	const id = await createBrainItem(supabase, {
		brainId,
		itemKind: humanItemKinds.connection,
		title: connection.relationship,
		body: connection.note,
		data
	});
	knownConnections.push({ id, title: connection.relationship, data });
}

function isSameConnection(known: IndexedHumanItem, connection: HarvestedConnection): boolean {
	if (nameKey(known.title) !== nameKey(connection.relationship)) return false;
	const knownPair = [String(known.data.from), String(known.data.to)].map(nameKey).sort();
	const statedPair = [connection.from, connection.to].map(nameKey).sort();
	return knownPair[0] === statedPair[0] && knownPair[1] === statedPair[1];
}
