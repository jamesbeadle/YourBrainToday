import {
	connectionEnds,
	peopleNetworkFrom,
	personKey,
	roleLine,
	type PeopleNetwork
} from './peopleNetwork';
import { dataFrom } from '$lib/components/knowledge/editors/editorFields';
import type { BrainContext, BrainPageLink, BrainPageSummary } from '$lib/data/brainModelTypes';
import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

export type HumanConstellation = {
	contexts: BrainContext[];
	pageIndex: BrainPageSummary[];
	pageLinks: BrainPageLink[];
};

const personNeuronKind = 'entity';
const organisationSlugPrefix = 'organisation:';

/** Organisations become lobes, people become neurons, and every relationship a fibre between two. */
export function buildHumanConstellation(items: KbBrainItem[]): HumanConstellation {
	const network = peopleNetworkFrom(items);
	return {
		contexts: organisationsOf(network),
		pageIndex: network.people.map(personNeuron),
		pageLinks: relationshipFibres(network)
	};
}

function organisationsOf(network: PeopleNetwork): BrainContext[] {
	const names = new Map<string, string>();
	for (const person of network.people) {
		const organisation = dataFrom(person, 'organisation');
		if (organisation !== '') names.set(organisationSlug(organisation), organisation);
	}
	return [...names].map(([slug, name]) => ({
		slug,
		name,
		summary: `People at ${name}`,
		isCoreDomain: false
	}));
}

function personNeuron(person: KbBrainItem): BrainPageSummary {
	const organisation = dataFrom(person, 'organisation');
	return {
		slug: person.id,
		title: person.title,
		summary: roleLine(person),
		kind: personNeuronKind,
		contextSlug: organisation === '' ? null : organisationSlug(organisation)
	};
}

function relationshipFibres(network: PeopleNetwork): BrainPageLink[] {
	return network.connections.flatMap((connection) => {
		const { from, to } = connectionEnds(connection);
		const fromSlug = network.personIdByName.get(personKey(from));
		const toSlug = network.personIdByName.get(personKey(to));
		if (fromSlug === undefined || toSlug === undefined) return [];
		return [{ fromSlug, toSlug }];
	});
}

function organisationSlug(organisation: string): string {
	return `${organisationSlugPrefix}${personKey(organisation)}`;
}
