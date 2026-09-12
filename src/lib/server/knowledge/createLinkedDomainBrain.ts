import type { SupabaseClient } from '@supabase/supabase-js';
import { createDomainBrain } from '$lib/server/entities/createDomainBrain';
import { createEntity } from '$lib/server/entities/createEntity';

export async function createLinkedDomainBrain(
	supabase: SupabaseClient,
	knowledgeBaseName: string,
	brainName: string,
	domainGoal: string
): Promise<string> {
	const entityId = await findOrCreateEntity(supabase, knowledgeBaseName);
	return createDomainBrain(supabase, entityId, brainName, domainGoal);
}

export async function findOrCreateEntity(
	supabase: SupabaseClient,
	entityName: string
): Promise<string> {
	const { data, error } = await supabase
		.from('entities')
		.select('id')
		.eq('name', entityName)
		.limit(1)
		.maybeSingle();
	if (error !== null) throw error;
	if (data !== null) return data.id;
	return createEntity(supabase, entityName);
}
