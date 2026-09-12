import type { SupabaseClient } from '@supabase/supabase-js';

export async function deleteChatbot(supabase: SupabaseClient, chatbotId: string): Promise<void> {
	const { error } = await supabase.from('chatbots').delete().eq('id', chatbotId);
	if (error !== null) throw error;
}
