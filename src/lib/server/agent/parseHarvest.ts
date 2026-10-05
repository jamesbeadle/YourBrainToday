import {
	parseConnections,
	parsePeople,
	type HarvestedConnection,
	type HarvestedPerson
} from './parseHumanHarvest';
import { storedMomentFrom } from '$lib/server/knowledge/storedMoment';

export type HarvestedEvent = {
	title: string;
	note: string;
	occurredAt: string | null;
	caseName: string | null;
	terms: string[];
};

export type HarvestedKnowledge = {
	expertiseFacts: string[];
	experienceEvents: HarvestedEvent[];
	people: HarvestedPerson[];
	connections: HarvestedConnection[];
};

export type HarvestPayload = {
	expertiseFacts?: unknown;
	experienceEvents?: unknown;
	people?: unknown;
	connections?: unknown;
};

export function parseHarvest(payload: HarvestPayload): HarvestedKnowledge {
	return {
		expertiseFacts: parseStrings(payload.expertiseFacts),
		experienceEvents: parseEvents(payload.experienceEvents),
		people: parsePeople(payload.people),
		connections: parseConnections(payload.connections)
	};
}

export function harvestedItemCount(harvest: HarvestedKnowledge): number {
	return (
		harvest.expertiseFacts.length +
		harvest.experienceEvents.length +
		harvest.people.length +
		harvest.connections.length
	);
}

function parseStrings(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value
		.filter((entry): entry is string => typeof entry === 'string')
		.map((entry) => entry.trim())
		.filter((entry) => entry !== '');
}

function parseEvents(value: unknown): HarvestedEvent[] {
	if (!Array.isArray(value)) return [];
	return value.flatMap((event) => {
		if (typeof event !== 'object' || event === null) return [];
		const record = event as Record<string, unknown>;
		if (typeof record.title !== 'string' || record.title.trim() === '') return [];
		return [
			{
				title: record.title.trim(),
				note: typeof record.note === 'string' ? record.note.trim() : '',
				occurredAt: occurredAtFrom(record.occurredAt),
				caseName: parseCaseName(record.caseName),
				terms: parseStrings(record.terms)
			}
		];
	});
}

function occurredAtFrom(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	return storedMomentFrom(value);
}

function parseCaseName(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed === '' ? null : trimmed;
}
