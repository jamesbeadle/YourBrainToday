import type { SupabaseClient } from '@supabase/supabase-js';
import type { ConversationTurn } from './conversationTypes';

export async function getConversationHistory(
	supabase: SupabaseClient,
	workflowId: string
): Promise<ConversationTurn[]> {
	const { data, error } = await supabase
		.from('agent_messages')
		.select('author, body')
		.eq('workflow_id', workflowId)
		.order('created_at', { ascending: true });
	if (error) throw error;
	return data.map((row) => ({ author: row.author, body: row.body }));
}
