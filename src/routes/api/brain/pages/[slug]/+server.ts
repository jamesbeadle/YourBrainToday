import { error, json } from '@sveltejs/kit';
import { getBrainContexts } from '$lib/server/brain/getBrainContexts';
import { getBrainPage } from '$lib/server/brain/getBrainPage';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to read your expertise brain');

	const brain = await getDomainBrain(locals.supabase, url.searchParams.get('brain') ?? '');
	if (brain === null) error(404, 'That expertise brain could not be found');

	const page = await getBrainPage(locals.supabase, brain.id, params.slug);
	if (page === null) error(404, 'That page is not in this expertise brain');
	const contexts = await getBrainContexts(locals.supabase, brain.id);
	const context = contexts.find((candidate) => candidate.slug === page.contextSlug) ?? null;
	return json({ page, contextName: context?.name ?? null });
};
