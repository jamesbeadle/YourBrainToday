import type { SupabaseClient } from '@supabase/supabase-js';

export async function setStaffAccess(
	supabase: SupabaseClient,
	targetEmail: string,
	isStaff: boolean
): Promise<void> {
	const { error } = await supabase.rpc('admin_set_staff', {
		target_email: targetEmail,
		staff: isStaff
	});
	if (error) throw error;
}
