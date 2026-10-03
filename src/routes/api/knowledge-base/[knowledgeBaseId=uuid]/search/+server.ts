import { error, json } from '@sveltejs/kit';
import { getKnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';
import { searchKnowledgeBase } from '$lib/server/search/searchKnowledgeBase';
import type { RequestHandler } from './$types';

/** `?q=words` — the pages and items of one knowledge base that match, as the signed-in person may read them. */
export const GET: RequestHandler = async ({ locals, params, url }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to search your knowledge base');
	const knowledgeBase = await getKnowledgeBase(locals.supabase, params.knowledgeBaseId);
	if (knowledgeBase === null) error(404, 'That knowledge base is not yours to open');
	const hits = await searchKnowledgeBase(locals.supabase, knowledgeBase.id, url.searchParams.get('q') ?? '');
	return json({ hits });
};
