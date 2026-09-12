import type { SupabaseClient } from '@supabase/supabase-js';

export async function setAccountRestriction(
	supabase: SupabaseClient,
	targetEmail: string,
	isRestricted: boolean
): Promise<void> {
	const { error } = await supabase.rpc('admin_set_restriction', {
		target_email: targetEmail,
		restricted: isRestricted
	});
	if (error) throw error;
}
