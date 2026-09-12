import type { SupabaseClient } from '@supabase/supabase-js';

export async function removeChatbotMember(
	supabase: SupabaseClient,
	memberRowId: string
): Promise<void> {
	const { error } = await supabase.from('chatbot_members').delete().eq('id', memberRowId);
	if (error !== null) throw error;
}
