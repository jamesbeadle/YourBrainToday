import type { SupabaseClient } from '@supabase/supabase-js';

// True for the invited worker: someone who has joined at least one chatbot
// and owns no knowledge base of their own, so their home is /chatbots.
export async function hasOnlyChatbotMemberships(
	supabase: SupabaseClient,
	userId: string
): Promise<boolean> {
	const knowledgeBaseCount = await countRows(supabase, 'knowledge_bases', 'owner_id', userId);
	if (knowledgeBaseCount > 0) return false;
	const membershipCount = await countRows(supabase, 'chatbot_members', 'member_id', userId);
	return membershipCount > 0;
}

async function countRows(
	supabase: SupabaseClient,
	table: string,
	userColumn: string,
	userId: string
): Promise<number> {
	const { count, error } = await supabase
		.from(table)
		.select('id', { count: 'exact', head: true })
		.eq(userColumn, userId);
	if (error !== null) throw error;
	return count ?? 0;
}
