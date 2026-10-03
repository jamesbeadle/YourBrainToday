import { loadKnowledgeIndex } from '$lib/server/knowledge/explorer/loadKnowledgeIndex';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	await requireUser(locals);
	const { knowledgeBase, brains, processMaps } = await parent();
	return {
		entries: await loadKnowledgeIndex(locals.supabase, knowledgeBase.id, brains, processMaps)
	};
};
