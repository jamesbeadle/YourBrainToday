import { error } from '@sveltejs/kit';
import { experienceBrainActions } from './experienceBrainActions';
import { expertiseBrainActions } from './expertiseBrainActions';
import { processBrainActions } from './processBrainActions';
import { findOpenBrain } from '$lib/data/knowledge/findOpenBrain';
import { loadBrainView } from '$lib/server/knowledge/brainViews/loadBrainView';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const user = await requireUser(locals);
	const { brains, processMaps } = await parent();
	const openBrain = findOpenBrain(params.brainId, brains, processMaps);
	if (openBrain === null) error(404, 'That brain is not in this knowledge base');
	return {
		openBrain,
		view: await loadBrainView(locals.supabase, user.id, openBrain, brains)
	};
};

export const actions = {
	...expertiseBrainActions,
	...experienceBrainActions,
	...processBrainActions
};
