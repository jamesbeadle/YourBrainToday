import { error, redirect } from '@sveltejs/kit';
import {
	approveHiveApplication,
	getHiveReviewQueue,
	rejectHiveApplication
} from '$lib/server/hive/hiveReview';
import {
	getHiveApplicationContexts,
	getHiveApplicationPages
} from '$lib/server/hive/hiveApplicationBrain';
import { requireAdmin } from '$lib/server/admin/requireAdmin';
import type { Actions, PageServerLoad, PageServerLoadEvent } from './$types';

export const load: PageServerLoad = async (event) => {
	redirect(307, '/knowledge-base');
	return loadApplication(event);
};

async function loadApplication({ locals, params }: PageServerLoadEvent) {
	await requireAdmin(locals);
	const queue = await getHiveReviewQueue(locals.supabase);
	const application = queue.find((entry) => entry.applicationId === params.applicationId);
	if (application === undefined) error(404, 'That application is not waiting for review');
	return {
		application,
		contexts: await getHiveApplicationContexts(locals.supabase, params.applicationId),
		pages: await getHiveApplicationPages(locals.supabase, params.applicationId)
	};
}

export const actions: Actions = {
	approveHiveApplication: async ({ locals, params }) => {
		redirect(307, '/knowledge-base');
		await requireAdmin(locals);
		await approveHiveApplication(locals.supabase, params.applicationId);
		redirect(303, '/admin');
	},
	rejectHiveApplication: async ({ locals, params, request }) => {
		redirect(307, '/knowledge-base');
		await requireAdmin(locals);
		const formData = await request.formData();
		const note = String(formData.get('note') ?? '').trim();
		await rejectHiveApplication(locals.supabase, params.applicationId, note);
		redirect(303, '/admin');
	}
};
