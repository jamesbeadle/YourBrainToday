import { dataFrom } from '../editors/editorFields';
import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

export type ItemDataField = { label: string; value: string };

/** Provenance has its own line, and the source id is bookkeeping nobody reads. */
const hiddenKeys = ['provenance', 'sourceId'];

export function dataFieldsOf(item: KbBrainItem): ItemDataField[] {
	return Object.entries(item.data)
		.filter(([key]) => !hiddenKeys.includes(key))
		.map(([key, value]) => ({ label: labelOf(key), value: textOf(value) }))
		.filter((field) => field.value !== '');
}

export function provenanceOf(item: KbBrainItem): string {
	return dataFrom(item, 'provenance');
}

function labelOf(key: string): string {
	const spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ').toLowerCase();
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function textOf(value: unknown): string {
	if (value === null || value === undefined) return '';
	if (typeof value === 'string') return value.trim();
	if (Array.isArray(value)) return value.map(textOf).filter((entry) => entry !== '').join(', ');
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
}
