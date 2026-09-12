import { redirect } from '@sveltejs/kit';
import { getHiveMembers } from '$lib/server/hive/getHiveMembers';
import { getRecentHiveQuestions } from '$lib/server/hive/getRecentHiveQuestions';
import type { PageServerLoad, PageServerLoadEvent } from './$types';

export const load: PageServerLoad = async (event) => {
	redirect(307, '/');
	return loadTradeTalk(event);
};

async function loadTradeTalk({ locals }: PageServerLoadEvent) {
	const { user } = await locals.safeGetSession();
	return {
		members: await getHiveMembers(locals.supabase),
		recentQuestions: user === null ? [] : await getRecentHiveQuestions(locals.supabase),
		isSignedIn: user !== null
	};
}
