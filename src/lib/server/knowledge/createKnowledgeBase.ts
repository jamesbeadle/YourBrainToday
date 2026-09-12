import type { SupabaseClient } from '@supabase/supabase-js';

export async function createKnowledgeBase(
	supabase: SupabaseClient,
	name: string,
	description: string
): Promise<string> {
	const { data, error } = await supabase
		.from('knowledge_bases')
		.insert({ name, description })
		.select('id')
		.single();
	if (error !== null) throw error;
	return data.id;
}
