import type { SupabaseClient } from '@supabase/supabase-js';

export type Workflow = {
	id: string;
	entityId: string;
	name: string;
};

export async function getWorkflow(
	supabase: SupabaseClient,
	workflowId: string
): Promise<Workflow | null> {
	const { data, error } = await supabase
		.from('workflows')
		.select('id, entity_id, name')
		.eq('id', workflowId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return { id: data.id, entityId: data.entity_id, name: data.name };
}
