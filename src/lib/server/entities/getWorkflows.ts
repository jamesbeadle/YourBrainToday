import type { SupabaseClient } from '@supabase/supabase-js';

export type WorkflowSummary = {
	id: string;
	name: string;
	createdAt: string;
};

export async function getWorkflows(
	supabase: SupabaseClient,
	entityId: string
): Promise<WorkflowSummary[]> {
	const { data, error } = await supabase
		.from('workflows')
		.select('id, name, created_at')
		.eq('entity_id', entityId)
		.order('created_at');
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({ id: row.id, name: row.name, createdAt: row.created_at }));
}
