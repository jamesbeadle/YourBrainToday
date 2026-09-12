import { fail, redirect } from '@sveltejs/kit';
import { createChatbot } from '$lib/server/chatbots/createChatbot';
import { deleteKnowledgeBase } from '$lib/server/knowledge/deleteKnowledgeBase';
import { getKnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';
import {
	removeKnowledgeBaseShare,
	shareKnowledgeBase
} from '$lib/server/knowledge/knowledgeBaseShares';
import { updateKnowledgeBase } from '$lib/server/knowledge/updateKnowledgeBase';
import { allKnowledgeBasesHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import { requireUser } from '$lib/server/auth/requireUser';
import type { Actions } from './$types';

export const actions: Actions = {
	setArchived: async ({ locals, params, request }) => {
		await requireUser(locals);
		const formData = await request.formData();
		const isArchived = String(formData.get('isArchived')) === 'true';
		await updateKnowledgeBase(locals.supabase, params.knowledgeBaseId, { isArchived });
	},
	deleteKnowledgeBase: async ({ locals, params }) => {
		const user = await requireUser(locals);
		const knowledgeBase = await getKnowledgeBase(locals.supabase, params.knowledgeBaseId);
		if (knowledgeBase === null || knowledgeBase.ownerId !== user.id) {
			return fail(403, { message: 'Only the owner can delete a knowledge base.' });
		}
		await deleteKnowledgeBase(locals.supabase, knowledgeBase.id);
		redirect(303, allKnowledgeBasesHref);
	},
	shareKnowledgeBase: async ({ locals, params, request }) => {
		await requireUser(locals);
		const formData = await request.formData();
		const viewerEmail = String(formData.get('viewerEmail') ?? '').trim();
		if (viewerEmail === '') return fail(400, { message: 'Enter an email address to share with.' });
		const shareProblem = await shareKnowledgeBase(
			locals.supabase,
			params.knowledgeBaseId,
			viewerEmail
		);
		if (shareProblem !== null) return fail(400, { message: shareProblem });
	},
	removeShare: async ({ locals, request }) => {
		await requireUser(locals);
		const formData = await request.formData();
		await removeKnowledgeBaseShare(locals.supabase, String(formData.get('shareId') ?? ''));
	},
	createChatbot: async ({ locals, params, request }) => {
		const user = await requireUser(locals);
		const knowledgeBase = await getKnowledgeBase(locals.supabase, params.knowledgeBaseId);
		if (knowledgeBase === null || knowledgeBase.ownerId !== user.id) {
			return fail(403, { message: 'Only the owner can create a chatbot.' });
		}
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		if (name === '') return fail(400, { message: 'Give the chatbot a name.' });
		const chatbotId = await createChatbot(locals.supabase, knowledgeBase.id, name);
		redirect(303, `/chatbots/${chatbotId}/manage`);
	}
};
