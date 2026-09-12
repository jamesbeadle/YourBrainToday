import type { SupabaseClient } from '@supabase/supabase-js';

export type ProcessMapSummary = {
	id: string;
	entityId: string;
	name: string;
	createdAt: string;
};

export async function getProcessMaps(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<ProcessMapSummary[]> {
	const entityIds = await linkedEntityIds(supabase, knowledgeBaseId);
	if (entityIds.length === 0) return [];
	const { data, error } = await supabase
		.from('workflows')
		.select('id, entity_id, name, created_at')
		.in('entity_id', entityIds)
		.order('created_at');
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		id: row.id,
		entityId: row.entity_id,
		name: row.name,
		createdAt: row.created_at
	}));
}

async function linkedEntityIds(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<string[]> {
	const { data, error } = await supabase
		.from('kb_brains')
		.select('domain_brain_id, domain_brains(entity_id)')
		.eq('knowledge_base_id', knowledgeBaseId)
		.not('domain_brain_id', 'is', null);
	if (error !== null) throw error;
	const rows = (data ?? []) as unknown as { domain_brains: LinkedDomain }[];
	const entityIds = rows.flatMap((row) => entityIdsFrom(row.domain_brains));
	return [...new Set(entityIds)];
}

type LinkedDomain = { entity_id: string } | { entity_id: string }[] | null;

function entityIdsFrom(linkedDomain: LinkedDomain): string[] {
	if (linkedDomain === null) return [];
	if (Array.isArray(linkedDomain)) return linkedDomain.map((domain) => domain.entity_id);
	return [linkedDomain.entity_id];
}
