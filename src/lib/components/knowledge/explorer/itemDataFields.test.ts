import { describe, expect, it } from 'vitest';
import { dataFieldsOf, provenanceOf } from './itemDataFields';
import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

function item(data: Record<string, unknown>): KbBrainItem {
	return {
		id: 'item',
		itemKind: 'episode',
		title: 'Survey signed off',
		body: '',
		data,
		parentItemId: null,
		position: 0,
		occurredAt: null,
		validFrom: null,
		validTo: null,
		createdAt: '2026-01-01'
	};
}

describe('dataFieldsOf', () => {
	it('labels keys, joins lists, and skips the empty and the bookkeeping', () => {
		const fields = dataFieldsOf(
			item({ newTerms: ['snag', 'handover'], outcome: '', provenance: 'site diary', sourceId: 'x', valid_to: null, status: 'open' })
		);
		expect(fields).toEqual([
			{ label: 'New terms', value: 'snag, handover' },
			{ label: 'Status', value: 'open' }
		]);
	});

	it('reads the provenance on its own', () => {
		expect(provenanceOf(item({ provenance: 'site diary' }))).toBe('site diary');
		expect(provenanceOf(item({}))).toBe('');
	});
});
