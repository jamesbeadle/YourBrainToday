import { getChatbotQuestionLog } from '$lib/server/chatbots/getChatbotQuestionLog';
import { getChatbotRulings } from '$lib/server/chatbots/getChatbotRulings';
import { csvFilenameFor, renderQuestionLogCsv } from '$lib/server/chatbots/renderQuestionLogCsv';
import { requireOwnedChatbot } from '$lib/server/chatbots/requireOwnedChatbot';
import { requireUser } from '$lib/server/auth/requireUser';
import type { RequestHandler } from './$types';

// The record, to hand over: the same exchanges the manage page shows.
export const GET: RequestHandler = async ({ locals, params }) => {
	const user = await requireUser(locals);
	const chatbot = await requireOwnedChatbot(locals.supabase, params.chatbotId, user.id);
	const rulings = await getChatbotRulings(locals.supabase, chatbot.id);
	const exchanges = await getChatbotQuestionLog(locals.supabase, chatbot.id, rulings);
	return new Response(renderQuestionLogCsv(exchanges), {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="${csvFilenameFor(chatbot.name)}"`
		}
	});
};
