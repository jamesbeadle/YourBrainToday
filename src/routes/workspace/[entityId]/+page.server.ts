import { redirect } from '@sveltejs/kit';
import { findEntityKnowledgeBaseId } from '$lib/server/knowledge/findEntityKnowledgeBase';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireUser(locals);
	const knowledgeBaseId = await findEntityKnowledgeBaseId(locals.supabase, params.entityId);
	if (knowledgeBaseId === null) redirect(302, '/knowledge-base');
	redirect(302, `/knowledge-base/${knowledgeBaseId}`);
};
