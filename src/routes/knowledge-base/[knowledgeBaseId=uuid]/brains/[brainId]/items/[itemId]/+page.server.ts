import { error } from '@sveltejs/kit';
import { loadItemReading } from '$lib/server/knowledge/explorer/loadItemReading';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	await requireUser(locals);
	const { brains } = await parent();
	const brain = brains.find((candidate) => candidate.id === params.brainId);
	if (brain === undefined) error(404, 'That brain is not in this knowledge base');
	return { brain, reading: await loadItemReading(locals.supabase, brain, params.itemId) };
};
