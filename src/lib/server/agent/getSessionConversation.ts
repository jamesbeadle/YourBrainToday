import type { SupabaseClient } from '@supabase/supabase-js';
import type { ConversationTurn } from './conversationTypes';

export async function getSessionConversation(
	supabase: SupabaseClient,
	sessionId: string
): Promise<ConversationTurn[]> {
	const { data, error } = await supabase
		.from('agent_messages')
		.select('author, body')
		.eq('session_id', sessionId)
		.order('created_at', { ascending: true });
	if (error) throw error;
	return data.map((row) => ({ author: row.author, body: row.body }));
}
