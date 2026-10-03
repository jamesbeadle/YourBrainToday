import { json } from '@sveltejs/kit';
import { hitsWithPageKeys } from '$lib/server/search/renderKnowledgeHits';
import { readKnowledgeBase } from '$lib/server/knowledge/reading/readKnowledgeBase';
import { resolveKnowledgeBaseApiCaller } from '$lib/server/brainApi/resolveKnowledgeBaseApiCaller';
import { searchKnowledgeBase } from '$lib/server/search/searchKnowledgeBase';
import type { RequestHandler } from './$types';

// `?q=words` — the pages and items of one knowledge base that match. A page
// hit carries the key the pages endpoint and read_pages take; an item hit
// carries the name of the brain it sits in.
export const GET: RequestHandler = async ({ request, params, url }) => {
	const { supabase, knowledgeBase } = await resolveKnowledgeBaseApiCaller(request, params.knowledgeBaseId);
	const reading = await readKnowledgeBase(supabase, knowledgeBase.id, ['expertise']);
	const hits = await searchKnowledgeBase(supabase, knowledgeBase.id, url.searchParams.get('q') ?? '');
	return json({ hits: hitsWithPageKeys(hits, reading.expertise, reading.brainNames) });
};
