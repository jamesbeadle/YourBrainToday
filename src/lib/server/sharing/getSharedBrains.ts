import { brainHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SharedBrainSummary } from '$lib/data/sharingTypes';

/** A shared brain opens in its knowledge base when the viewer can see it there, else on its workspace. */
export async function getSharedBrains(
	supabase: SupabaseClient,
	userId: string
): Promise<SharedBrainSummary[]> {
	const { data, error } = await supabase
		.from('domain_brains')
		.select('id, name, entity_id, owner_id, entities (name), kb_brains (id, knowledge_base_id)')
		.neq('owner_id', userId)
		.is('edition_of', null)
		.order('name');
	if (error !== null) throw error;
	return ((data ?? []) as unknown as SharedBrainRow[]).map((row) => ({
		brainId: row.id,
		entityId: row.entity_id,
		brainName: row.name,
		entityName: nameFrom(row.entities),
		href: hrefFor(row)
	}));
}

type Filing = { id: string; knowledge_base_id: string };

type SharedBrainRow = {
	id: string;
	name: string;
	entity_id: string;
	entities: { name: string } | { name: string }[] | null;
	kb_brains: Filing | Filing[] | null;
};

function nameFrom(entity: SharedBrainRow['entities']): string {
	if (entity === null) return '';
	if (Array.isArray(entity)) return entity[0]?.name ?? '';
	return entity.name;
}

function hrefFor(row: SharedBrainRow): string {
	const filing = filingFrom(row.kb_brains);
	if (filing === null) return `/workspace/${row.entity_id}/domains/${row.id}`;
	return brainHref(filing.knowledge_base_id, filing.id);
}

function filingFrom(filings: SharedBrainRow['kb_brains']): Filing | null {
	if (filings === null) return null;
	if (Array.isArray(filings)) return filings[0] ?? null;
	return filings;
}
