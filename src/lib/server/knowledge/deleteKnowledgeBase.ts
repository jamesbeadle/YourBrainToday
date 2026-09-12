import type { SupabaseClient } from '@supabase/supabase-js';
import { deleteDomainBrain } from '$lib/server/entities/deleteDomainBrain';
import { deleteEntity } from '$lib/server/entities/deleteEntity';
import { findEntityKnowledgeBaseId } from './findEntityKnowledgeBase';

/**
 * Deletes a knowledge base outright: its second brains, their contents, shares,
 * the linked expertise brains (with their stored source files), and — once nothing
 * else refers to it — the plumbing entity that carried its process maps.
 */
export async function deleteKnowledgeBase(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<void> {
	const linkedBrains = await getLinkedDomainBrains(supabase, knowledgeBaseId);
	for (const linked of linkedBrains) await deleteDomainBrain(supabase, linked.domainBrainId);
	await deleteKnowledgeBaseRow(supabase, knowledgeBaseId);
	const entityIds = [...new Set(linkedBrains.map((linked) => linked.entityId))];
	for (const entityId of entityIds) await deleteEntityIfOrphaned(supabase, entityId);
}

type LinkedDomainBrain = { domainBrainId: string; entityId: string };

async function getLinkedDomainBrains(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<LinkedDomainBrain[]> {
	const { data, error } = await supabase
		.from('kb_brains')
		.select('domain_brain_id, domain_brains(entity_id)')
		.eq('knowledge_base_id', knowledgeBaseId)
		.not('domain_brain_id', 'is', null);
	if (error !== null) throw error;
	const rows = (data ?? []) as unknown as {
		domain_brain_id: string;
		domain_brains: { entity_id: string } | null;
	}[];
	return rows
		.filter((row) => row.domain_brains !== null)
		.map((row) => ({
			domainBrainId: row.domain_brain_id,
			entityId: row.domain_brains!.entity_id
		}));
}

async function deleteKnowledgeBaseRow(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<void> {
	const { error } = await supabase.from('knowledge_bases').delete().eq('id', knowledgeBaseId);
	if (error !== null) throw error;
}

/** The entity goes only when no other knowledge base still files a brain from it. */
async function deleteEntityIfOrphaned(supabase: SupabaseClient, entityId: string): Promise<void> {
	const otherKnowledgeBaseId = await findEntityKnowledgeBaseId(supabase, entityId);
	if (otherKnowledgeBaseId !== null) return;
	for (const brainId of await getEntityDomainBrainIds(supabase, entityId)) {
		await deleteDomainBrain(supabase, brainId);
	}
	await deleteEntity(supabase, entityId);
}

async function getEntityDomainBrainIds(
	supabase: SupabaseClient,
	entityId: string
): Promise<string[]> {
	const { data, error } = await supabase
		.from('domain_brains')
		.select('id')
		.eq('entity_id', entityId);
	if (error !== null) throw error;
	return (data ?? []).map((row) => row.id);
}
