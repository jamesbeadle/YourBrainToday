import { connectionsOf, otherEnd, peopleNetworkFrom } from './peopleNetwork';
import { dataFrom } from '$lib/components/knowledge/editors/editorFields';
import { findWarmth, warmthScale } from '$lib/data/knowledge/humanConnections';
import type { BrainPagePayload } from '../constellation/fetchBrainPage';
import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

/** A person's page is drawn from the brain already in hand: who they are, then everyone they know, warmest first. */
export function personPage(items: KbBrainItem[], personId: string): Promise<BrainPagePayload> {
	const network = peopleNetworkFrom(items);
	const person = network.people.find((candidate) => candidate.id === personId);
	if (person === undefined) return Promise.reject(new Error('That person is not in this brain'));
	const organisation = dataFrom(person, 'organisation');
	return Promise.resolve({
		page: {
			slug: person.id,
			title: person.title,
			summary: dataFrom(person, 'role'),
			kind: 'entity',
			contextSlug: null,
			body: [person.body, connectionsSection(connectionsOf(network, person), person)]
				.filter((section) => section !== '')
				.join('\n\n'),
			updatedAt: person.createdAt
		},
		contextName: organisation === '' ? null : organisation
	});
}

function connectionsSection(connections: KbBrainItem[], person: KbBrainItem): string {
	if (connections.length === 0) return '_No relationships recorded yet._';
	const lines = [...connections]
		.sort((first, second) => warmthRank(first) - warmthRank(second))
		.map((connection) => connectionLine(connection, person));
	return ['## Relationships', ...lines].join('\n');
}

function connectionLine(connection: KbBrainItem, person: KbBrainItem): string {
	const warmth = findWarmth(dataFrom(connection, 'warmth'));
	const note = connection.body === '' ? '' : ` — ${connection.body}`;
	return `- **${warmth.label}** · ${connection.title} · ${otherEnd(connection, person)}${note}`;
}

function warmthRank(connection: KbBrainItem): number {
	const warmth = findWarmth(dataFrom(connection, 'warmth')).warmth;
	return warmthScale.findIndex((definition) => definition.warmth === warmth);
}
