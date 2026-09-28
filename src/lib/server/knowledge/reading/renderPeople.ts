import { clipPromptSection, clipPromptText } from './clipPromptText';
import { knowledgeReadingCaps } from '$lib/data/knowledge/knowledgeReadingCaps';
import { findWarmth, humanItemKinds } from '$lib/data/knowledge/humanConnections';
import type { HumanItem } from './readPeople';

const { longestHumanNote, longestHumanSection } = knowledgeReadingCaps;

const truncationNote = '(The rest of the network is not shown.)';

export function renderPeople(items: HumanItem[]): string {
	const people = items.filter((item) => item.itemKind === humanItemKinds.person);
	const connections = items.filter((item) => item.itemKind === humanItemKinds.connection);
	if (people.length === 0) return 'The human brain knows nobody yet.';
	const rendered = [
		'People:',
		...people.map(renderPerson),
		'Relationships, with how well each pair gets on:',
		...connections.map(renderConnection)
	].join('\n');
	return clipPromptSection(rendered, longestHumanSection, truncationNote);
}

function renderPerson(person: HumanItem): string {
	const standing = [person.data.role, person.data.organisation]
		.filter((value) => typeof value === 'string' && value !== '')
		.join(', ');
	const note = person.body === '' ? '' : `: ${clipPromptText(person.body, longestHumanNote)}`;
	return `- ${person.title}${standing === '' ? '' : ` (${standing})`}${note}`;
}

function renderConnection(connection: HumanItem): string {
	const warmth = findWarmth(String(connection.data.warmth ?? ''));
	const note =
		connection.body === '' ? '' : ` — ${clipPromptText(connection.body, longestHumanNote)}`;
	return `- ${connection.data.from} · ${connection.title} · ${connection.data.to} [${warmth.label}]${note}`;
}
