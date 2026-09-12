import { bindInstanceBrain } from './brainBindings';
import { createKbBrain } from './createKbBrain';
import { createLinkedDomainBrain, findOrCreateEntity } from './createLinkedDomainBrain';
import { createWorkflow } from '$lib/server/entities/createWorkflow';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function seedKnowledgeBaseBrains(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	knowledgeBaseName: string
): Promise<void> {
	const expertiseBrainId = await seedExpertiseBrain(supabase, knowledgeBaseId, knowledgeBaseName);
	await seedExperienceBrain(supabase, knowledgeBaseId, knowledgeBaseName, expertiseBrainId);
	await seedProcessBrain(supabase, knowledgeBaseName);
}

async function seedExpertiseBrain(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	knowledgeBaseName: string
): Promise<string> {
	const brainName = `${knowledgeBaseName} Expertise`;
	const domainGoal = `Understand ${knowledgeBaseName} — its language, its rules, and how it fits together.`;
	return createKbBrain(supabase, {
		knowledgeBaseId,
		category: 'domain',
		brainType: 'ddd_model',
		name: brainName,
		description: domainGoal,
		domainBrainId: await createLinkedDomainBrain(
			supabase,
			knowledgeBaseName,
			brainName,
			domainGoal
		)
	});
}

async function seedExperienceBrain(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	knowledgeBaseName: string,
	expertiseBrainId: string
): Promise<void> {
	const experienceBrainId = await createKbBrain(supabase, {
		knowledgeBaseId,
		category: 'instance',
		brainType: 'episodic_log',
		name: `${knowledgeBaseName} Experience`,
		description: `What has actually happened in ${knowledgeBaseName}, as it happened.`
	});
	await bindInstanceBrain(supabase, experienceBrainId, expertiseBrainId);
}

async function seedProcessBrain(
	supabase: SupabaseClient,
	knowledgeBaseName: string
): Promise<void> {
	const entityId = await findOrCreateEntity(supabase, knowledgeBaseName);
	await createWorkflow(supabase, entityId, `${knowledgeBaseName} Process`);
}
