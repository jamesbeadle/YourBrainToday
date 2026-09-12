import type { SupabaseClient } from '@supabase/supabase-js';

export type DomainBrain = {
	id: string;
	entityId: string;
	ownerId: string;
	name: string;
	domainGoal: string;
};

export async function getDomainBrain(
	supabase: SupabaseClient,
	brainId: string
): Promise<DomainBrain | null> {
	const { data, error } = await supabase
		.from('domain_brains')
		.select('id, entity_id, owner_id, name, domain_goal')
		.eq('id', brainId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return asDomainBrain(data);
}

export async function getLatestDomainBrain(
	supabase: SupabaseClient
): Promise<DomainBrain | null> {
	const { data, error } = await supabase
		.from('domain_brains')
		.select('id, entity_id, owner_id, name, domain_goal')
		.is('edition_of', null)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return asDomainBrain(data);
}

function asDomainBrain(row: {
	id: string;
	entity_id: string;
	owner_id: string;
	name: string;
	domain_goal: string;
}): DomainBrain {
	return {
		id: row.id,
		entityId: row.entity_id,
		ownerId: row.owner_id,
		name: row.name,
		domainGoal: row.domain_goal
	};
}
