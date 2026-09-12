import type { SupabaseClient } from '@supabase/supabase-js';

export type KbBrainRow = {

	id: string;
	knowledge_base_id: string;
	category: string;
	name: string;
	updated_at: string;
	domain_brains: { entity_id: string; entities: { name: string } | null } | null;
};

export async function loadKbBrains(supabase: SupabaseClient): Promise<KbBrainRow[]> {
	const { data, error } = await supabase
		.from('kb_brains')
		.select('id, knowledge_base_id, category, name, updated_at, domain_brains(entity_id, entities(name))')
		.order('created_at');
	if (error !== null) throw error;
	return (data ?? []) as unknown as KbBrainRow[];
}

export type ProcessRow = {
	id: string;
	entity_id: string;
	name: string;
	created_at: string;
	entities: { name: string } | null;
};

export async function loadProcessMaps(
	supabase: SupabaseClient,
	brainRows: KbBrainRow[]
): Promise<ProcessRow[]> {
	const entityIds = [
		...new Set(
			brainRows
				.map((row) => row.domain_brains?.entity_id)
				.filter((entityId): entityId is string => typeof entityId === 'string')
		)
	];
	if (entityIds.length === 0) return [];
	const { data, error } = await supabase
		.from('workflows')
		.select('id, entity_id, name, created_at, entities(name)')
		.in('entity_id', entityIds)
		.order('created_at');
	if (error !== null) throw error;
	return (data ?? []) as unknown as ProcessRow[];
}
