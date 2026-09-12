import { getBrainPageIndex } from '$lib/server/brain/getBrainPageIndex';
import { getWorkflows } from '$lib/server/entities/getWorkflows';
import type { SupabaseClient } from '@supabase/supabase-js';

export type InterviewContext = {
	knowledgeBaseName: string;
	expertisePages: string[];
	recentEpisodes: string[];
	processNames: string[];
};

export type PrimaryExpertiseBrain = {
	kbBrainId: string;
	domainBrainId: string;
	entityId: string;
};

export async function findPrimaryExpertiseBrain(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<PrimaryExpertiseBrain | null> {
	const { data, error } = await supabase
		.from('kb_brains')
		.select('id, domain_brain_id, domain_brains(entity_id)')
		.eq('knowledge_base_id', knowledgeBaseId)
		.eq('category', 'domain')
		.not('domain_brain_id', 'is', null)
		.order('created_at')
		.limit(1);
	if (error !== null) throw error;
	const row = ((data ?? []) as unknown as PrimaryBrainRow[])[0];
	if (row === undefined) return null;
	const entityId = entityIdFrom(row.domain_brains);
	if (entityId === null) return null;
	return { kbBrainId: row.id, domainBrainId: row.domain_brain_id, entityId };
}

type PrimaryBrainRow = {
	id: string;
	domain_brain_id: string;
	domain_brains: LinkedEntity;
};

type LinkedEntity = { entity_id: string } | { entity_id: string }[] | null;

function entityIdFrom(linkedEntity: LinkedEntity): string | null {
	if (linkedEntity === null) return null;
	if (Array.isArray(linkedEntity)) return linkedEntity[0]?.entity_id ?? null;
	return linkedEntity.entity_id;
}

export async function buildInterviewContext(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	knowledgeBaseName: string,
	primary: PrimaryExpertiseBrain | null
): Promise<InterviewContext> {
	return {
		knowledgeBaseName,
		expertisePages: primary === null ? [] : await expertisePageTitles(supabase, primary),
		recentEpisodes: await recentEpisodeTitles(supabase, knowledgeBaseId),
		processNames: primary === null ? [] : await processNames(supabase, primary.entityId)
	};
}

async function expertisePageTitles(
	supabase: SupabaseClient,
	primary: PrimaryExpertiseBrain
): Promise<string[]> {
	const pageIndex = await getBrainPageIndex(supabase, primary.domainBrainId);
	return pageIndex.slice(0, 40).map((page) => page.title);
}

async function recentEpisodeTitles(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<string[]> {
	const { data, error } = await supabase
		.from('kb_brain_items')
		.select('title, kb_brains!inner(knowledge_base_id)')
		.eq('kb_brains.knowledge_base_id', knowledgeBaseId)
		.order('created_at', { ascending: false })
		.limit(10);
	if (error !== null) throw error;
	return (data ?? []).map((row) => row.title as string);
}

async function processNames(supabase: SupabaseClient, entityId: string): Promise<string[]> {
	const workflows = await getWorkflows(supabase, entityId);
	return workflows.map((workflow) => workflow.name);
}
