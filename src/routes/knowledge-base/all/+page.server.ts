import { fail, redirect } from '@sveltejs/kit';
import { getChatbotsForMember } from '$lib/server/chatbots/getChatbotsForMember';
import { createKnowledgeBase } from '$lib/server/knowledge/createKnowledgeBase';
import { getReceivedInvites } from '$lib/server/sharing/workspaceInvites';
import { getSecondBrainRegister } from '$lib/server/knowledge/getSecondBrainRegister';
import { seedKnowledgeBaseBrains } from '$lib/server/knowledge/seedKnowledgeBaseBrains';
import { getSharedBrains } from '$lib/server/sharing/getSharedBrains';
import { getSharedWorkflowSummaries } from '$lib/server/maps/getSharedMaps';
import { knowledgeBaseHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import { requireUser } from '$lib/server/auth/requireUser';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await requireUser(locals);
	return {
		register: await getSecondBrainRegister(locals.supabase),
		sharedBrains: await getSharedBrains(locals.supabase, user.id),
		sharedWorkflows: await getSharedWorkflowSummaries(locals.supabase),
		invitations: await getReceivedInvites(locals.supabase, user.email ?? ''),
		memberChatbots: await getChatbotsForMember(locals.supabase, user.id)
	};
};

export const actions: Actions = {
	createKnowledgeBase: async ({ locals, request }) => {
		await requireUser(locals);
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();
		if (name === '') return fail(400, { message: 'A knowledge base needs a name.' });
		const knowledgeBaseId = await createKnowledgeBase(locals.supabase, name, description);
		await seedKnowledgeBaseBrains(locals.supabase, knowledgeBaseId, name);
		redirect(303, knowledgeBaseHref(knowledgeBaseId));
	}
};
