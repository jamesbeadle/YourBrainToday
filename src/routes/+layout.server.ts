import { getKnowledgeBaseList } from '$lib/server/knowledge/getKnowledgeBaseList';
import { getCreditBalance } from '$lib/server/credits/getCreditBalance';
import { getProfileFlags } from '$lib/server/auth/getProfileFlags';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) {
		return { userEmail: null, creditBalance: null, isAdmin: false, knowledgeBases: [] };
	}
	const profileFlags = await getProfileFlags(locals.supabase);
	return {
		userEmail: user.email ?? '',
		creditBalance: await getCreditBalance(locals.supabase),
		isAdmin: profileFlags.isAdmin,
		knowledgeBases: await getKnowledgeBaseList(locals.supabase)
	};
};
