import { redirect } from '@sveltejs/kit';
import { getKnowledgeBaseList } from '$lib/server/knowledge/getKnowledgeBaseList';
import { allKnowledgeBasesHref, knowledgeBaseHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await requireUser(locals);
	const knowledgeBases = await getKnowledgeBaseList(locals.supabase);
	const mostRecentlyUpdated = knowledgeBases.find(
		(knowledgeBase) => knowledgeBase.ownerId === user.id && !knowledgeBase.isArchived
	);
	if (mostRecentlyUpdated === undefined) redirect(302, allKnowledgeBasesHref);
	redirect(302, knowledgeBaseHref(mostRecentlyUpdated.id));
};
