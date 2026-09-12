import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainConversationChannel } from '$lib/data/brainTypes';

export async function createBrainConversation(
	supabase: SupabaseClient,
	brainId: string,
	channel: BrainConversationChannel,
	// Only for service-role writes (the API), where auth.uid() cannot fill
	// the owner default. Session writes omit it.
	ownerId?: string
): Promise<string> {
	const { data, error } = await supabase
		.from('brain_conversations')
		.insert({ brain_id: brainId, channel, ...(ownerId === undefined ? {} : { owner_id: ownerId }) })
		.select('id')
		.single();
	if (error !== null) throw error;
	return data.id;
}
