import { redirect } from '@sveltejs/kit';
import { getChatbot } from '$lib/server/chatbots/getChatbot';
import { getChatbotConversation } from '$lib/server/chatbots/getChatbotConversation';
import { getChatbotMembership } from '$lib/server/chatbots/getChatbotMembership';
import { getChatbotOwnerName } from '$lib/server/chatbots/getChatbotOwnerName';
import { joinChatbot } from '$lib/server/chatbots/joinChatbot';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { PageServerLoad } from './$types';

// The invite link is the acceptance: an invitee who signs in with the
// invited address is joined on arrival, so there is nothing to click.
export const load: PageServerLoad = async ({ locals, params, url }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) {
		const next = encodeURIComponent(url.pathname);
		redirect(303, `/account/sign-in?next=${next}&invited=1`);
	}
	const joined = await joinChatbot(locals.supabase, params.chatbotId);
	const chatbot = await getChatbot(locals.supabase, params.chatbotId);
	if (chatbot !== null && chatbot.ownerId === user.id && joined === 'not_invited') {
		redirect(303, `/chatbots/${chatbot.id}/manage`);
	}
	if (chatbot === null || joined === 'not_invited') {
		return { chatbot: null, membership: null, conversation: null, ownerName: null };
	}
	return {
		chatbot,
		membership: await getChatbotMembership(locals.supabase, chatbot.id, user.id, chatbot.modelId),
		conversation: await getChatbotConversation(locals.supabase, chatbot.id, user.id),
		ownerName: await getChatbotOwnerName(supabaseServiceClient(), chatbot.ownerId)
	};
};
