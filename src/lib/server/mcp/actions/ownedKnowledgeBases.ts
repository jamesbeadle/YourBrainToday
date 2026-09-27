import { findPrimaryExpertiseBrain } from '$lib/server/knowledge/interviewContext';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import type { SupabaseClient } from '@supabase/supabase-js';

type OwnedKnowledgeBase = { id: string; name: string };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

/** Sent data lands in a knowledge base's primary expertise brain, which routes it on to the rest. */
export async function sentDataReceiverFor(
	serviceSupabase: SupabaseClient,
	accountId: string,
	knowledgeBaseId: string
): Promise<{ id: string; ownerId: string } | null> {
	if (!uuidPattern.test(knowledgeBaseId)) return null;
	const isOwned = await isOwnedKnowledgeBase(serviceSupabase, accountId, knowledgeBaseId);
	if (!isOwned) return null;
	const primary = await findPrimaryExpertiseBrain(serviceSupabase, knowledgeBaseId);
	if (primary === null) return null;
	return getDomainBrain(serviceSupabase, primary.domainBrainId);
}

async function isOwnedKnowledgeBase(
	serviceSupabase: SupabaseClient,
	accountId: string,
	knowledgeBaseId: string
): Promise<boolean> {
	const { data, error } = await serviceSupabase
		.from('knowledge_bases')
		.select('id')
		.eq('id', knowledgeBaseId)
		.eq('owner_id', accountId)
		.maybeSingle();
	if (error !== null) throw error;
	return data !== null;
}
