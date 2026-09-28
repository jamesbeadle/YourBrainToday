import { findPrimaryExpertiseBrain } from '$lib/server/knowledge/interviewContext';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import { getKnowledgeBase, type KnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';
import { isUuid } from '$lib/data/isUuid';
import { readText } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { SupabaseClient } from '@supabase/supabase-js';

type OwnedKnowledgeBase = { id: string; name: string };

type OwnedKnowledgeBaseRun = (
	caller: McpCaller,
	knowledgeBase: KnowledgeBase,
	input: Record<string, unknown>
) => Promise<string>;

export const knowledgeBaseIdField = {
	type: 'string',
	description: 'The id from list_knowledge_bases'
};

const notYourKnowledgeBase = 'No knowledge base of yours has that id — call list_knowledge_bases.';

export async function findOwnedKnowledgeBases(
	serviceSupabase: SupabaseClient,
	accountId: string
): Promise<OwnedKnowledgeBase[]> {
	const { data, error } = await serviceSupabase
		.from('knowledge_bases')
		.select('id, name')
		.eq('owner_id', accountId)
		.eq('is_archived', false)
		.order('updated_at', { ascending: false });
	if (error !== null) throw error;
	return data ?? [];
}

export async function findOwnedKnowledgeBase(
	serviceSupabase: SupabaseClient,
	accountId: string,
	knowledgeBaseId: string
): Promise<KnowledgeBase | null> {
	if (!isUuid(knowledgeBaseId)) return null;
	const knowledgeBase = await getKnowledgeBase(serviceSupabase, knowledgeBaseId);
	if (knowledgeBase === null || knowledgeBase.isArchived) return null;
	if (knowledgeBase.ownerId !== accountId) return null;
	return knowledgeBase;
}

/** Every brain action runs on a knowledge base the caller owns, named by knowledge_base_id. */
export function onOwnedKnowledgeBase(run: OwnedKnowledgeBaseRun) {
	return async (caller: McpCaller, input: Record<string, unknown>): Promise<string> => {
		const knowledgeBase = await findOwnedKnowledgeBase(
			caller.supabase,
			caller.accountId,
			readText(input, 'knowledge_base_id')
		);
		if (knowledgeBase === null) return notYourKnowledgeBase;
		return run(caller, knowledgeBase, input);
	};
}

/** Sent data lands in a knowledge base's primary expertise brain, which routes it on to the rest. */
export async function sentDataReceiverFor(
	serviceSupabase: SupabaseClient,
	accountId: string,
	knowledgeBaseId: string
): Promise<{ id: string; ownerId: string } | null> {
	const knowledgeBase = await findOwnedKnowledgeBase(serviceSupabase, accountId, knowledgeBaseId);
	if (knowledgeBase === null) return null;
	const primary = await findPrimaryExpertiseBrain(serviceSupabase, knowledgeBase.id);
	if (primary === null) return null;
	return getDomainBrain(serviceSupabase, primary.domainBrainId);
}
