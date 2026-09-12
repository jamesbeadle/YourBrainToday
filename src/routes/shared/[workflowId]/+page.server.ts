import { error } from '@sveltejs/kit';
import { getSharedMap, getSharedWorkflowSummaries } from '$lib/server/maps/getSharedMaps';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireUser(locals);
	const model = await getSharedMap(locals.supabase, params.workflowId);
	if (model === null) error(404, 'This process map is not shared with you');
	const summaries = await getSharedWorkflowSummaries(locals.supabase);
	const summary = summaries.find((candidate) => candidate.workflowId === params.workflowId);
	return {
		model,
		workflowName: summary?.workflowName ?? 'Shared workflow',
		ownerEmail: summary?.ownerEmail ?? 'Unknown owner'
	};
};
