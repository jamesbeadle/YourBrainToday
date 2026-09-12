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
};

export function parseHarvest(payload: {
	expertiseFacts?: unknown;
	experienceEvents?: unknown;
}): HarvestedKnowledge {
	return {
		expertiseFacts: parseStrings(payload.expertiseFacts),
		experienceEvents: parseEvents(payload.experienceEvents)
	};
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
				occurredAt: typeof record.occurredAt === 'string' ? record.occurredAt : null,
				caseName: parseCaseName(record.caseName),
				terms: parseStrings(record.terms)
			}
		];
	});
}

function parseCaseName(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed === '' ? null : trimmed;
}
