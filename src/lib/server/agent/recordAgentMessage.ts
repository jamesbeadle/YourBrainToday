import type { SupabaseClient } from '@supabase/supabase-js';
import type { ConversationAuthor } from './conversationTypes';

export async function recordAgentMessage(
	supabase: SupabaseClient,
	message: {
		sessionId: string;
		userId: string;
		workflowId: string;
		author: ConversationAuthor;
		body: string;
	}
): Promise<void> {
	const { error } = await supabase.from('agent_messages').insert({
		session_id: message.sessionId,
		user_id: message.userId,
		workflow_id: message.workflowId,
		author: message.author,
		body: message.body
	});
	if (error) throw error;
}
