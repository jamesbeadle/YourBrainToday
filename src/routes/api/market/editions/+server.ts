import { error, json } from '@sveltejs/kit';
import { publishBrainEdition } from '$lib/server/market/publishBrainEdition';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to publish an edition');

	const payload = await request.json();
	const brainId = typeof payload.brainId === 'string' ? payload.brainId : '';
	const editionName = typeof payload.name === 'string' ? payload.name.trim() : '';
	if (brainId === '') error(400, 'A expertise brain is required');
	if (editionName === '') error(400, 'An edition needs a name');

	const published = await publishBrainEdition(locals.supabase, brainId, editionName);
	if (published === 'no_listing') {
		error(400, 'Save a listing for this brain before publishing an edition');
	}
	if (published === 'edition_needs_a_name') error(400, 'An edition needs a name');
	return json({ snapshotBrainId: published.snapshotBrainId });
};
