import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	BrainConversationChannel,
	BrainConversationMessage,
	BrainConversationThread
} from '$lib/data/brainTypes';

export async function getBrainConversationThread(
	supabase: SupabaseClient,
	brainId: string,
	channel: BrainConversationChannel
): Promise<BrainConversationThread> {
	const conversationId = await getLatestConversationId(supabase, brainId, channel);
	if (conversationId === null) return { conversationId: null, messages: [] };
	return { conversationId, messages: await getConversationMessages(supabase, conversationId) };
}

export async function getLatestConversationId(
	supabase: SupabaseClient,
	brainId: string,
	channel: BrainConversationChannel
): Promise<string | null> {
	const { data, error } = await supabase
		.from('brain_conversations')
		.select('id')
		.eq('brain_id', brainId)
		.eq('channel', channel)
		.order('last_message_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error !== null) throw error;
	return data?.id ?? null;
}

export async function getConversationMessages(
	supabase: SupabaseClient,
	conversationId: string
): Promise<BrainConversationMessage[]> {
	const { data, error } = await supabase
		.from('brain_messages')
		.select('id, speaker, body, cited_slugs, created_at')
		.eq('conversation_id', conversationId)
		.order('id');
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		id: row.id,
		speaker: row.speaker,
		body: row.body,
		citedSlugs: row.cited_slugs ?? [],
		createdAt: row.created_at
	}));
}
