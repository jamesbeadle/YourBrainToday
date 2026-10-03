import { error, json } from '@sveltejs/kit';
import { findBrainSource } from '$lib/server/brain/findBrainSource';
import { getSourceTouchedSlugs } from '$lib/server/brain/getSourceContributions';
import type { RequestHandler } from './$types';

/** What a source added to the brain: the pages it created or updated, and its counts. */
export const GET: RequestHandler = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to see what a document added');
	const source = await findBrainSource(locals.supabase, params.sourceId);
	if (source === null) error(404, 'That document could not be found');
	const pageSlugs = await getSourceTouchedSlugs(locals.supabase, source.id);
	return json({ pageSlugs, progress: source.progress });
};
