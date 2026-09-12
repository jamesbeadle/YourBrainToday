import { error, fail } from '@sveltejs/kit';
import { addMapViewer } from '$lib/server/maps/addMapViewer';
import { getProcessMaps } from '$lib/server/knowledge/getProcessMaps';
import { removeMapViewer } from '$lib/server/maps/removeMapViewer';
import { requireUser } from '$lib/server/auth/requireUser';
import type { Actions } from './$types';

export const processBrainActions: Actions = {
	addViewer: async ({ locals, params, request }) => {
		const user = await requireUser(locals);
		await requireProcessMapInKnowledgeBase(locals, params.knowledgeBaseId, params.brainId);
		const formData = await request.formData();
		const viewerEmail = String(formData.get('viewerEmail') ?? '').trim();
		if (viewerEmail === '') return fail(400, { message: 'An email address is required.' });
		await addMapViewer(locals.supabase, user.id, params.brainId, viewerEmail);
		return { sharedWith: viewerEmail };
	},
	removeViewer: async ({ locals, params, request }) => {
		await requireUser(locals);
		await requireProcessMapInKnowledgeBase(locals, params.knowledgeBaseId, params.brainId);
		const formData = await request.formData();
		const viewerId = Number(formData.get('viewerId'));
		if (!Number.isInteger(viewerId)) return fail(400, { message: 'Unknown viewer.' });
		await removeMapViewer(locals.supabase, viewerId);
		return {};
	}
};

async function requireProcessMapInKnowledgeBase(
	locals: App.Locals,
	knowledgeBaseId: string,
	workflowId: string
): Promise<void> {
	const processMaps = await getProcessMaps(locals.supabase, knowledgeBaseId);
	const isInKnowledgeBase = processMaps.some((processMap) => processMap.id === workflowId);
	if (!isInKnowledgeBase) error(404, 'That process brain is not in this knowledge base');
}
