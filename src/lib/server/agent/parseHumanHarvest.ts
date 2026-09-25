import { isWarmth, unknownWarmth, type Warmth } from '$lib/data/knowledge/humanConnections';

export type HarvestedPerson = {
	name: string;
	role: string;
	organisation: string;
	note: string;
};

export type HarvestedConnection = {
	from: string;
	to: string;
	relationship: string;
	warmth: Warmth;
	note: string;
};

export function parsePeople(value: unknown): HarvestedPerson[] {
	return recordsIn(value).flatMap((record) => {
		const name = textFrom(record.name);
		if (name === '') return [];
		return [
			{
				name,
				role: textFrom(record.role),
				organisation: textFrom(record.organisation),
				note: textFrom(record.note)
			}
		];
	});
}

export function parseConnections(value: unknown): HarvestedConnection[] {
	return recordsIn(value).flatMap((record) => {
		const from = textFrom(record.from);
		const to = textFrom(record.to);
		const relationship = textFrom(record.relationship);
		if (from === '' || to === '' || relationship === '') return [];
		if (from.toLowerCase() === to.toLowerCase()) return [];
		return [
			{
				from,
				to,
				relationship,
				warmth: isWarmth(record.warmth) ? record.warmth : unknownWarmth,
				note: textFrom(record.note)
			}
		];
	});
}

function recordsIn(value: unknown): Record<string, unknown>[] {
	if (!Array.isArray(value)) return [];
	return value.filter(
		(entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null
	);
}

function textFrom(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}
