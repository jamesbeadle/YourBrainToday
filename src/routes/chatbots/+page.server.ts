import { getChatbotsForMember } from '$lib/server/chatbots/getChatbotsForMember';
import { getChatbotsForOwner } from '$lib/server/chatbots/getChatbotsForOwner';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await requireUser(locals);
	return {
		memberChatbots: await getChatbotsForMember(locals.supabase, user.id),
		ownedGroups: await getChatbotsForOwner(locals.supabase, user.id)
	};
};
