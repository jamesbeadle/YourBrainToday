export type ParsedBrainItem = {
	itemKind: string;
	title: string;
	body: string;
	data: Record<string, string>;
	parentItemId: string | null;
	occurredAt: string | null;
	validFrom: string | null;
	validTo: string | null;
};

const DATA_PREFIX = 'data.';

export function parseBrainItemForm(formData: FormData): ParsedBrainItem {
	return {
		itemKind: textFrom(formData, 'itemKind'),
		title: textFrom(formData, 'title') || 'Untitled',
		body: textFrom(formData, 'body'),
		data: dataEntriesFrom(formData),
		parentItemId: identifierFrom(formData, 'parentItemId'),
		occurredAt: momentFrom(formData, 'occurredAt'),
		validFrom: momentFrom(formData, 'validFrom'),
		validTo: momentFrom(formData, 'validTo')
	};
}

function textFrom(formData: FormData, name: string): string {
	return String(formData.get(name) ?? '').trim();
}

function identifierFrom(formData: FormData, name: string): string | null {
	const value = textFrom(formData, name);
	return value === '' ? null : value;
}

function momentFrom(formData: FormData, name: string): string | null {
	const value = textFrom(formData, name);
	if (value === '') return null;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function dataEntriesFrom(formData: FormData): Record<string, string> {
	const entries: Record<string, string> = {};
	for (const [name, value] of formData.entries()) {
		if (!name.startsWith(DATA_PREFIX)) continue;
		entries[name.slice(DATA_PREFIX.length)] = String(value).trim();
	}
	return entries;
}
