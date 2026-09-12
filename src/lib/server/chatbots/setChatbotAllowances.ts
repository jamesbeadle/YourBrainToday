import type { MemberAllowance } from '$lib/data/chatbotTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

// Changes what each member may spend this period without touching the pool
// or anyone's spent counter — the top-up is the only thing that resets those.
export async function setChatbotAllowances(
	supabase: SupabaseClient,
	chatbotId: string,
	allowances: MemberAllowance[]
): Promise<void> {
	const { error } = await supabase.rpc('set_chatbot_allowances', {
		target_chatbot: chatbotId,
		member_allowances: allowances
	});
	if (error !== null) throw error;
}
