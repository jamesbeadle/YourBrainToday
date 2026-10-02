import { humanItemKinds } from '$lib/data/knowledge/humanConnections';
import { connectionEnds, personKey } from '$lib/components/brain/people/peopleNetwork';
import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

export type ConnectionEnd = { name: string; itemId: string | null };

export type ItemRelations = {
	parent: KbBrainItem | null;
	children: KbBrainItem[];
	connectionEnds: ConnectionEnd[];
};

/** What an item is tied to: the case it sits in, what sits inside it, and for a connection its two people. */
export function itemRelationsOf(items: KbBrainItem[], item: KbBrainItem): ItemRelations {
	return {
		parent: items.find((candidate) => candidate.id === item.parentItemId) ?? null,
		children: items.filter((candidate) => candidate.parentItemId === item.id),
		connectionEnds: item.itemKind === humanItemKinds.connection ? endsOf(items, item) : []
	};
}

function endsOf(items: KbBrainItem[], connection: KbBrainItem): ConnectionEnd[] {
	const people = items.filter((candidate) => candidate.itemKind === humanItemKinds.person);
	const { from, to } = connectionEnds(connection);
	return [from, to].map((name) => ({
		name,
		itemId: people.find((person) => personKey(person.title) === personKey(name))?.id ?? null
	}));
}
