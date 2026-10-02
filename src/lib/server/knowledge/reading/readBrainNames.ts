import type { SupabaseClient } from '@supabase/supabase-js';

// Every brain of the knowledge base by its kb_brains id, so a search hit in
// an experience or human brain can be named without another read.
export async function readBrainNames(
	supabase: SupabaseClient,
	knowledgeBaseId: string
): Promise<Map<string, string>> {
	const { data, error } = await supabase
		.from('kb_brains')
		.select('id, name')
		.eq('knowledge_base_id', knowledgeBaseId);
	if (error !== null) throw error;
	return new Map((data ?? []).map((row) => [row.id as string, row.name as string]));
}
