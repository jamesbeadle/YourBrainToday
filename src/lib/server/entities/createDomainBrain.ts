import type { SupabaseClient } from '@supabase/supabase-js';

export async function createDomainBrain(
	supabase: SupabaseClient,
	entityId: string,
	name: string,
	domainGoal: string
): Promise<string> {
	const { data, error } = await supabase
		.from('domain_brains')
		.insert({ entity_id: entityId, name, domain_goal: domainGoal })
		.select('id')
		.single();
	if (error !== null) throw error;
	return data.id;
}
