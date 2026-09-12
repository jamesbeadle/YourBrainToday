import { redirect } from '@sveltejs/kit';
import { getProfileFlags } from '$lib/server/auth/getProfileFlags';
import { requireUser } from '$lib/server/auth/requireUser';
import type { User } from '@supabase/supabase-js';

export async function requireStaff(locals: App.Locals): Promise<User> {
	const user = await requireUser(locals);
	const profileFlags = await getProfileFlags(locals.supabase);
	const isProjectManager = profileFlags.isStaff || profileFlags.isAdmin;
	if (!isProjectManager || profileFlags.isRestricted) redirect(303, '/');
	return user;
}
