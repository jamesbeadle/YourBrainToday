import { fail } from '@sveltejs/kit';
import { isUuid } from '$lib/data/isUuid';
import { longestPreferredAnswer, longestRulingQuestion } from '$lib/data/chatbotRulings';
import { removeChatbotRuling } from '$lib/server/chatbots/removeChatbotRuling';
import { requireOwnedChatbot } from '$lib/server/chatbots/requireOwnedChatbot';
import { requireUser } from '$lib/server/auth/requireUser';
import { setChatbotRuling } from '$lib/server/chatbots/setChatbotRuling';
import type { RequestEvent } from './$types';

export async function setPreferredAnswer({ locals, params, request }: RequestEvent) {
	const user = await requireUser(locals);
	const chatbot = await requireOwnedChatbot(locals.supabase, params.chatbotId, user.id);
	const formData = await request.formData();
	const question = String(formData.get('question') ?? '').trim().slice(0, longestRulingQuestion);
	const preferredAnswer = String(formData.get('answer') ?? '').trim().slice(0, longestPreferredAnswer);
	if (question === '') return fail(400, { message: 'Say which question this answers.' });
	if (preferredAnswer === '') return fail(400, { message: 'Write the answer you would rather it gave.' });
	await setChatbotRuling(locals.supabase, chatbot.id, {
		question,
		preferredAnswer,
		askedByMemberId: memberIdFrom(formData)
	});
}

export async function removeRuling({ locals, params, request }: RequestEvent) {
	const user = await requireUser(locals);
	const chatbot = await requireOwnedChatbot(locals.supabase, params.chatbotId, user.id);
	const formData = await request.formData();
	const rulingId = String(formData.get('rulingId') ?? '');
	if (!isUuid(rulingId)) return fail(400, { message: 'That preferred answer could not be found.' });
	await removeChatbotRuling(locals.supabase, chatbot.id, rulingId);
}

function memberIdFrom(formData: FormData): string | null {
	const candidate = String(formData.get('askedByMemberId') ?? '');
	return isUuid(candidate) ? candidate : null;
}
