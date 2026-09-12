import type { SupabaseClient } from '@supabase/supabase-js';

export type JoinOutcome = 'joined' | 'not_invited';

export async function joinChatbot(
	supabase: SupabaseClient,
	chatbotId: string
): Promise<JoinOutcome> {
	const { error } = await supabase.rpc('join_chatbot', { target_chatbot: chatbotId });
	if (error === null) return 'joined';
	if (error.message.includes('not_invited')) return 'not_invited';
	throw error;
}
