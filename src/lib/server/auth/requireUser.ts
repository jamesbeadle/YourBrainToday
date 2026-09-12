import { redirect } from '@sveltejs/kit';
import type { User } from '@supabase/supabase-js';

export async function requireUser(locals: App.Locals): Promise<User> {
	const { user } = await locals.safeGetSession();
	if (user === null) redirect(303, '/account/sign-in');
	return user;
}
