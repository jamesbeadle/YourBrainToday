import type { SupabaseClient } from '@supabase/supabase-js';

export type ProfileFlags = { isAdmin: boolean; isStaff: boolean; isRestricted: boolean };

export async function getProfileFlags(supabase: SupabaseClient): Promise<ProfileFlags> {
	const { data, error } = await supabase
		.from('profiles')
		.select('is_admin, is_staff, is_restricted')
		.maybeSingle();
	if (error) throw error;
	return {
		isAdmin: data?.is_admin ?? false,
		isStaff: data?.is_staff ?? false,
		isRestricted: data?.is_restricted ?? false
	};
}
