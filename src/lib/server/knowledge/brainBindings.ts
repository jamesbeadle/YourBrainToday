import type { SupabaseClient } from '@supabase/supabase-js';

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
