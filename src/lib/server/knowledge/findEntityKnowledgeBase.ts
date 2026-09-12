import type { SupabaseClient } from '@supabase/supabase-js';

export async function findEntityKnowledgeBaseId(
	supabase: SupabaseClient,
	entityId: string
): Promise<string | null> {
	const { data, error } = await supabase
		.from('kb_brains')
		.select('knowledge_base_id, domain_brains!inner(entity_id)')
		.eq('domain_brains.entity_id', entityId)
		.limit(1);
	if (error !== null) throw error;
	const row = (data ?? [])[0] as { knowledge_base_id: string } | undefined;
	return row?.knowledge_base_id ?? null;
}
