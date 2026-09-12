import { error, fail } from '@sveltejs/kit';
import { addMapViewer } from '$lib/server/maps/addMapViewer';
import { getConversationHistory } from '$lib/server/agent/getConversationHistory';
import { getLatestWorkflowMap } from '$lib/server/maps/getLatestWorkflowMap';
import { getMapViewers } from '$lib/server/maps/getMapViewers';
import { findEntityKnowledgeBaseId } from '$lib/server/knowledge/findEntityKnowledgeBase';
import { redirectToFiledBrain } from '$lib/server/knowledge/redirectToFiledBrain';
import { knowledgeBaseHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import { getWorkflow } from '$lib/server/entities/getWorkflow';
import { removeMapViewer } from '$lib/server/maps/removeMapViewer';
import { requireUser } from '$lib/server/auth/requireUser';
import type { ChatMessage } from '$lib/data/chatTypes';
import type { Workflow } from '$lib/server/entities/getWorkflow';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireUser(locals);
	const workflow = await requireWorkflow(locals, params.entityId, params.workflowId);
	const conversationHistory = await getConversationHistory(locals.supabase, workflow.id);
	const messages: ChatMessage[] = conversationHistory.map((turn, turnIndex) => ({
		id: turnIndex,
		author: turn.author,
		text: turn.body
	}));
	const knowledgeBaseId = await findEntityKnowledgeBaseId(locals.supabase, workflow.entityId);
	await redirectToFiledBrain(locals.supabase, knowledgeBaseId, workflow.id);
	return {
		workflow,
		messages,
		latestMap: await getLatestWorkflowMap(locals.supabase, workflow.id),
		viewers: await getMapViewers(locals.supabase, workflow.id),
		backHref: knowledgeBaseId === null ? '/knowledge-base' : knowledgeBaseHref(knowledgeBaseId)
	};
};

export const actions: Actions = {
	addViewer: async ({ locals, params, request }) => {
		const user = await requireUser(locals);
		const workflow = await requireWorkflow(locals, params.entityId, params.workflowId);
		const formData = await request.formData();
		const viewerEmail = String(formData.get('viewerEmail') ?? '').trim();
		if (viewerEmail === '') return fail(400, { message: 'An email address is required.' });
		await addMapViewer(locals.supabase, user.id, workflow.id, viewerEmail);
		return { sharedWith: viewerEmail };
	},
	removeViewer: async ({ locals, params, request }) => {
		await requireUser(locals);
		await requireWorkflow(locals, params.entityId, params.workflowId);
		const formData = await request.formData();
		const viewerId = Number(formData.get('viewerId'));
		if (!Number.isInteger(viewerId)) return fail(400, { message: 'Unknown viewer.' });
		await removeMapViewer(locals.supabase, viewerId);
		return {};
	}
};

async function requireWorkflow(
	locals: App.Locals,
	entityId: string,
	workflowId: string
): Promise<Workflow> {
	const workflow = await getWorkflow(locals.supabase, workflowId);
	if (workflow === null || workflow.entityId !== entityId) {
		error(404, 'That workflow is not in this entity');
	}
	return workflow;
}
