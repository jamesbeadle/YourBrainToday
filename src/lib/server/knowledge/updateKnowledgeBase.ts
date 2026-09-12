import type { SupabaseClient } from '@supabase/supabase-js';

type KnowledgeBaseChanges = {
	name?: string;
	description?: string;
	isArchived?: boolean;
};

export async function updateKnowledgeBase(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	changes: KnowledgeBaseChanges
): Promise<void> {
	const { error } = await supabase
		.from('knowledge_bases')
		.update({
			...(changes.name === undefined ? {} : { name: changes.name }),
			...(changes.description === undefined ? {} : { description: changes.description }),
			...(changes.isArchived === undefined ? {} : { is_archived: changes.isArchived }),
			updated_at: new Date().toISOString()
		})
		.eq('id', knowledgeBaseId);
	if (error !== null) throw error;
}

export async function touchKnowledgeBase(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<void> {
	const { error } = await supabase
		.from('knowledge_bases')
		.update({ updated_at: new Date().toISOString() })
		.eq('id', knowledgeBaseId);
	if (error !== null) throw error;
}
