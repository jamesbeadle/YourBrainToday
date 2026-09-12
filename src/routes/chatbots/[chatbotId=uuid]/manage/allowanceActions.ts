import { fail } from '@sveltejs/kit';
import { parseAllowances, parseCredits } from '$lib/server/chatbots/parseTopUpForm';
import { requireOwnedChatbot } from '$lib/server/chatbots/requireOwnedChatbot';
import { requireUser } from '$lib/server/auth/requireUser';
import { setChatbotAllowances } from '$lib/server/chatbots/setChatbotAllowances';
import { topUpChatbot } from '$lib/server/chatbots/topUpChatbot';
import type { RequestEvent } from './$types';

// A top-up funds the pool and starts everyone's period again; updating
// allowances only changes the limits, so a zero-credit top-up stays refused.
export async function topUp({ locals, params, request }: RequestEvent) {
	const user = await requireUser(locals);
	const chatbot = await requireOwnedChatbot(locals.supabase, params.chatbotId, user.id);
	const formData = await request.formData();
	const credits = parseCredits(formData);
	if (credits === null) return fail(400, { message: 'Enter how many credits to add.' });
	const outcome = await topUpChatbot(locals.supabase, chatbot.id, credits, parseAllowances(formData));
	if (outcome === 'insufficient_credits') {
		return fail(402, { message: "You don't have that many credits to give." });
	}
	if (outcome === 'account_restricted') {
		return fail(403, { message: 'Your account is currently restricted.' });
	}
}

export async function updateAllowances({ locals, params, request }: RequestEvent) {
	const user = await requireUser(locals);
	const chatbot = await requireOwnedChatbot(locals.supabase, params.chatbotId, user.id);
	const formData = await request.formData();
	await setChatbotAllowances(locals.supabase, chatbot.id, parseAllowances(formData));
}
