import type { SupabaseClient } from '@supabase/supabase-js';

export type KnowledgeBase = {
	id: string;
	ownerId: string;
	name: string;
	description: string;
	isArchived: boolean;
	updatedAt: string;
};

export async function getKnowledgeBase(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<KnowledgeBase | null> {
	const { data, error } = await supabase
		.from('knowledge_bases')
		.select('id, owner_id, name, description, is_archived, updated_at')
		.eq('id', knowledgeBaseId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return {
		id: data.id,
		ownerId: data.owner_id,
		name: data.name,
		description: data.description,
		isArchived: data.is_archived,
		updatedAt: data.updated_at
	};
}
