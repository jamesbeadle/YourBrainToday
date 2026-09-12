import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainAccessRole } from '$lib/data/marketTypes';
import type { DomainBrain } from '$lib/server/entities/getDomainBrain';

export async function resolveBrainAccessRole(
	supabase: SupabaseClient,
	brain: DomainBrain,
	userId: string
): Promise<BrainAccessRole> {
	if (brain.ownerId === userId) return 'owner';
	if (await isBrainCollaborator(supabase, brain, userId)) return 'collaborator';
	return 'reader';
}

async function isBrainCollaborator(
	supabase: SupabaseClient,
	brain: DomainBrain,
	userId: string
): Promise<boolean> {
	const { data, error } = await supabase
		.from('workspace_shares')
		.select('id')
		.eq('collaborator_id', userId)
		.or(`brain_id.eq.${brain.id},entity_id.eq.${brain.entityId}`)
		.limit(1);
	if (error !== null) throw error;
	return (data ?? []).length > 0;
}
