import { fail, redirect } from '@sveltejs/kit';
import { deleteChatbot } from '$lib/server/chatbots/deleteChatbot';
import { isLadderModel } from '$lib/data/modelLadder';
import { requireOwnedChatbot } from '$lib/server/chatbots/requireOwnedChatbot';
import { requireUser } from '$lib/server/auth/requireUser';
import { updateChatbot } from '$lib/server/chatbots/updateChatbot';
import type { RequestEvent } from './$types';

export async function rename({ locals, params, request }: RequestEvent) {
	const user = await requireUser(locals);
	const chatbot = await requireOwnedChatbot(locals.supabase, params.chatbotId, user.id);
	const formData = await request.formData();
	const name = String(formData.get('name') ?? '').trim();
	if (name === '') return fail(400, { message: 'The chatbot needs a name.' });
	await updateChatbot(locals.supabase, chatbot.id, { name });
}

export async function setPaused({ locals, params, request }: RequestEvent) {
	const user = await requireUser(locals);
	const chatbot = await requireOwnedChatbot(locals.supabase, params.chatbotId, user.id);
	const formData = await request.formData();
	const isPaused = String(formData.get('isPaused')) === 'true';
	await updateChatbot(locals.supabase, chatbot.id, { isPaused });
}

export async function setModel({ locals, params, request }: RequestEvent) {
	const user = await requireUser(locals);
	const chatbot = await requireOwnedChatbot(locals.supabase, params.chatbotId, user.id);
	const formData = await request.formData();
	const modelId = String(formData.get('modelId') ?? '');
	if (!isLadderModel(modelId)) return fail(400, { message: 'Pick a model from the slider.' });
	await updateChatbot(locals.supabase, chatbot.id, { modelId });
}

export async function deleteThisChatbot({ locals, params }: RequestEvent) {
	const user = await requireUser(locals);
	const chatbot = await requireOwnedChatbot(locals.supabase, params.chatbotId, user.id);
	await deleteChatbot(locals.supabase, chatbot.id);
	redirect(303, `/knowledge-base/${chatbot.knowledgeBaseId}`);
}
