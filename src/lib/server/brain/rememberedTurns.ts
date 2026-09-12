import { getConversationMessages } from './getBrainConversation';
import type { BrainConversationTurn } from '$lib/data/brainTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const longestRememberedExchange = 12;

export async function rememberedTurns(
	supabase: SupabaseClient,
	conversationId: string
): Promise<BrainConversationTurn[]> {
	const messages = await getConversationMessages(supabase, conversationId);
	return messages
		.slice(-longestRememberedExchange)
		.map((message) => ({ speaker: message.speaker, text: message.body }));
}
