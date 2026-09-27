import { humanItemKinds } from '$lib/data/knowledge/humanConnections';
import type { SupabaseClient } from '@supabase/supabase-js';

const mostPeopleNamed = 40;

export async function getKnownPeopleNames(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<string[]> {
	const { data, error } = await supabase
		.from('kb_brain_items')
		.select('title, kb_brains!inner(knowledge_base_id)')
		.eq('kb_brains.knowledge_base_id', knowledgeBaseId)
		.eq('item_kind', humanItemKinds.person)
		.order('created_at', { ascending: false })
		.limit(mostPeopleNamed);
	if (error !== null) throw error;
	return (data ?? []).map((row) => row.title as string);
}
