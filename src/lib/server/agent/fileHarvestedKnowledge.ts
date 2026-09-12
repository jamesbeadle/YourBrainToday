import { createBrainItem } from '$lib/server/knowledge/createBrainItem';
import { fileExperienceEvents } from '$lib/server/knowledge/experienceWriter';
import { findOrCreateHarvestBrain } from './harvestBrains';
import { findPrimaryExpertiseBrain } from '$lib/server/knowledge/interviewContext';
import { getBrainPageIndex } from '$lib/server/brain/getBrainPageIndex';
import type { HarvestedKnowledge } from './parseHarvest';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function fileHarvestedKnowledge(
	supabase: SupabaseClient,
	entityId: string,
	harvest: HarvestedKnowledge
): Promise<void> {
	if (harvest.expertiseFacts.length === 0 && harvest.experienceEvents.length === 0) return;
	const knowledgeBaseIds = await linkedKnowledgeBaseIds(supabase, entityId);
	if (knowledgeBaseIds.length === 0) return;
	await fileHarvestToKnowledgeBase(supabase, knowledgeBaseIds[0], harvest);
}

export async function fileHarvestToKnowledgeBase(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	harvest: HarvestedKnowledge
): Promise<void> {
	if (harvest.expertiseFacts.length > 0) {
		const factsBrainId = await findOrCreateHarvestBrain(supabase, knowledgeBaseId, 'rules');
		await fileFacts(supabase, factsBrainId, harvest.expertiseFacts);
	}
	if (harvest.experienceEvents.length > 0) {
		const eventsBrainId = await findOrCreateHarvestBrain(supabase, knowledgeBaseId, 'episodic_log');
		const knownTerms = await expertiseTermsFor(supabase, knowledgeBaseId);
		await fileExperienceEvents(supabase, eventsBrainId, harvest.experienceEvents, knownTerms);
	}
}

async function linkedKnowledgeBaseIds(
	supabase: SupabaseClient,
	entityId: string
): Promise<string[]> {
	const { data, error } = await supabase
		.from('kb_brains')
		.select('knowledge_base_id, domain_brains!inner(entity_id)')
		.eq('domain_brains.entity_id', entityId);
	if (error !== null) throw error;
	const knowledgeBaseIds = (data ?? []).map((row) => row.knowledge_base_id as string);
	return [...new Set(knowledgeBaseIds)];
}

async function expertiseTermsFor(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<string[]> {
	const primary = await findPrimaryExpertiseBrain(supabase, knowledgeBaseId);
	if (primary === null) return [];
	const pageIndex = await getBrainPageIndex(supabase, primary.domainBrainId);
	return pageIndex.map((page) => page.title);
}

async function fileFacts(
	supabase: SupabaseClient,
	factsBrainId: string,
	facts: string[]
): Promise<void> {
	for (const fact of facts) {
		await createBrainItem(supabase, { brainId: factsBrainId, itemKind: 'rule', title: fact });
	}
}
