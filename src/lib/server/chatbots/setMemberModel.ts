import type { SupabaseClient } from '@supabase/supabase-js';

// null clears the override so the member follows the bot's own model.
export async function setMemberModel(
	supabase: SupabaseClient,
	memberRowId: string,
	modelId: string | null
): Promise<void> {
	const { error } = await supabase
		.from('chatbot_members')
		.update({ model_id: modelId })
		.eq('id', memberRowId);
	if (error !== null) throw error;
}
