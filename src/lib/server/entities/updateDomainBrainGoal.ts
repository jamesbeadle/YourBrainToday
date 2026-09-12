import type { SupabaseClient } from '@supabase/supabase-js';

export async function updateDomainBrainGoal(
	supabase: SupabaseClient,
	brainId: string,
	domainGoal: string
): Promise<void> {
	const { error } = await supabase
		.from('domain_brains')
		.update({ domain_goal: domainGoal })
		.eq('id', brainId);
	if (error !== null) throw error;
}
