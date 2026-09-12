import type { SupabaseClient } from '@supabase/supabase-js';

export type BrainBinding = { instanceBrainId: string; domainBrainId: string };

export async function getBindingsForKnowledgeBase(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<BrainBinding[]> {
	const { data, error } = await supabase
		.from('kb_brain_bindings')
		.select('instance_brain_id, domain_brain_id, instance:kb_brains!instance_brain_id(knowledge_base_id)')
		.eq('instance.knowledge_base_id', knowledgeBaseId);
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		instanceBrainId: row.instance_brain_id,
		domainBrainId: row.domain_brain_id
	}));
}

export async function getBoundDomainBrainIds(
	supabase: SupabaseClient,
	instanceBrainId: string
): Promise<string[]> {
	const { data, error } = await supabase
		.from('kb_brain_bindings')
		.select('domain_brain_id')
		.eq('instance_brain_id', instanceBrainId);
	if (error !== null) throw error;
	return (data ?? []).map((row) => row.domain_brain_id);
}

export async function bindInstanceBrain(
	supabase: SupabaseClient,
	instanceBrainId: string,
	domainBrainId: string
): Promise<void> {
	const { error } = await supabase
		.from('kb_brain_bindings')
		.upsert({ instance_brain_id: instanceBrainId, domain_brain_id: domainBrainId });
	if (error !== null) throw error;
}

export async function unbindInstanceBrain(
	supabase: SupabaseClient,
	instanceBrainId: string,
	domainBrainId: string
): Promise<void> {
	const { error } = await supabase
		.from('kb_brain_bindings')
		.delete()
		.eq('instance_brain_id', instanceBrainId)
		.eq('domain_brain_id', domainBrainId);
	if (error !== null) throw error;
}
