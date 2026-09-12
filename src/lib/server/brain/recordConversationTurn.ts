import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainAnswer } from '$lib/data/brainTypes';

export async function recordConversationTurn(
	supabase: SupabaseClient,
	conversationId: string,
	question: string,
	answer: BrainAnswer,
	// Only for service-role writes (the API), where auth.uid() cannot fill
	// the owner default. Session writes omit it.
	ownerId?: string
): Promise<void> {
	const owner = ownerId === undefined ? {} : { owner_id: ownerId };
	const { error } = await supabase.from('brain_messages').insert([
		{ conversation_id: conversationId, speaker: 'user', body: question, cited_slugs: [], ...owner },
		{
			conversation_id: conversationId,
			speaker: 'modeller',
			body: answer.answerMarkdown,
			cited_slugs: answer.citedSlugs,
			...owner
		}
	]);
	if (error !== null) throw error;
	await touchConversation(supabase, conversationId);
}

async function touchConversation(
	supabase: SupabaseClient,
	conversationId: string
): Promise<void> {
	const { error } = await supabase
		.from('brain_conversations')
		.update({ last_message_at: new Date().toISOString() })
		.eq('id', conversationId);
	if (error !== null) throw error;
}
