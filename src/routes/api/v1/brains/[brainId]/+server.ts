import { json } from '@sveltejs/kit';
import { getBrainContexts } from '$lib/server/brain/getBrainContexts';
import { getBrainPageIndex, renderDomainModelIndex } from '$lib/server/brain/getBrainPageIndex';
import { resolveApiCaller } from '$lib/server/brainApi/resolveApiCaller';
import type { RequestHandler } from './$types';

// The front door of one brain's API: who it is, and the full model index an
// agent needs to decide which pages to read.
export const GET: RequestHandler = async ({ request, params }) => {
	const { supabase, brain } = await resolveApiCaller(request, params.brainId);
	const contexts = await getBrainContexts(supabase, brain.id);
	const pages = await getBrainPageIndex(supabase, brain.id);
	return json({
		brain: { id: brain.id, name: brain.name, domainGoal: brain.domainGoal },
		contexts,
		pages,
		indexMarkdown: renderDomainModelIndex(contexts, pages)
	});
};
