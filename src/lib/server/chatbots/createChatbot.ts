import type { SupabaseClient } from '@supabase/supabase-js';

export async function createChatbot(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	name: string
): Promise<string> {
	const { data, error } = await supabase
		.from('chatbots')
		.insert({ knowledge_base_id: knowledgeBaseId, name })
		.select('id')
		.single();
	if (error !== null) throw error;
	return data.id;
}
