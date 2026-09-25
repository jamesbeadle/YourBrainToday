import { dataFrom } from '$lib/components/knowledge/editors/editorFields';
import { humanItemKinds } from '$lib/data/knowledge/humanConnections';
import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

export type PeopleNetwork = {
	people: KbBrainItem[];
	connections: KbBrainItem[];
	personIdByName: Map<string, string>;
};

export function peopleNetworkFrom(items: KbBrainItem[]): PeopleNetwork {
	const people = items.filter((item) => item.itemKind === humanItemKinds.person);
	return {
		people,
		connections: items.filter((item) => item.itemKind === humanItemKinds.connection),
		personIdByName: new Map(people.map((person) => [personKey(person.title), person.id]))
	};
}

export function personKey(name: string): string {
	return name.trim().toLowerCase();
}

export function connectionEnds(connection: KbBrainItem): { from: string; to: string } {
	return { from: dataFrom(connection, 'from'), to: dataFrom(connection, 'to') };
}

export function connectionsOf(network: PeopleNetwork, person: KbBrainItem): KbBrainItem[] {
	const key = personKey(person.title);
	return network.connections.filter((connection) => {
		const { from, to } = connectionEnds(connection);
		return personKey(from) === key || personKey(to) === key;
	});
}

export function otherEnd(connection: KbBrainItem, person: KbBrainItem): string {
	const { from, to } = connectionEnds(connection);
	return personKey(from) === personKey(person.title) ? to : from;
}

export function roleLine(person: KbBrainItem): string {
	const role = dataFrom(person, 'role');
	const organisation = dataFrom(person, 'organisation');
	if (role !== '' && organisation !== '') return `${role} · ${organisation}`;
	return role || organisation;
}
