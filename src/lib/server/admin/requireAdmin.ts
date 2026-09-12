import { redirect } from '@sveltejs/kit';
import { getProfileFlags } from '$lib/server/auth/getProfileFlags';
import { requireUser } from '$lib/server/auth/requireUser';

export async function requireAdmin(locals: App.Locals): Promise<void> {
	await requireUser(locals);
	const profileFlags = await getProfileFlags(locals.supabase);
	if (!profileFlags.isAdmin) redirect(303, '/');
}
