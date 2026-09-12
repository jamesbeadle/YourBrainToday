import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatbotChanges = { name?: string; isPaused?: boolean; modelId?: string };

export async function updateChatbot(
	supabase: SupabaseClient,
	chatbotId: string,
	changes: ChatbotChanges
): Promise<void> {
	const { error } = await supabase
		.from('chatbots')
		.update({
			...(changes.name === undefined ? {} : { name: changes.name }),
			...(changes.isPaused === undefined ? {} : { is_paused: changes.isPaused }),
			...(changes.modelId === undefined ? {} : { model_id: changes.modelId }),
			updated_at: new Date().toISOString()
		})
		.eq('id', chatbotId);
	if (error !== null) throw error;
}
