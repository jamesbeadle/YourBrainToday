import { error, json } from '@sveltejs/kit';
import { getBrainPagesBySlugs } from '$lib/server/brain/getBrainPage';
import { resolveApiCaller } from '$lib/server/brainApi/resolveApiCaller';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, params }) => {
	const { supabase, brain } = await resolveApiCaller(request, params.brainId);
	const pages = await getBrainPagesBySlugs(supabase, brain.id, [params.slug]);
	const page = pages[0];
	if (page === undefined) error(404, 'That page does not exist in this brain');
	return json(page);
};
