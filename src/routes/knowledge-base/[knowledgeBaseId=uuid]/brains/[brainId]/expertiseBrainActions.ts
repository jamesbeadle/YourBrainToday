import { error, fail, redirect } from '@sveltejs/kit';
import { deleteDomainBrain } from '$lib/server/entities/deleteDomainBrain';
import { getKbBrain } from '$lib/server/knowledge/getKbBrain';
import { requireDomainBrain } from '$lib/server/knowledge/brainViews/loadExpertiseBrainView';
import { updateDomainBrainGoal } from '$lib/server/entities/updateDomainBrainGoal';
import { knowledgeBaseHref } from '$lib/data/knowledge/knowledgeBaseRoutes';
import { requireUser } from '$lib/server/auth/requireUser';
import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
import type { Actions } from './$types';

export const expertiseBrainActions: Actions = {
	updateDomainGoal: async ({ locals, params, request }) => {
		const brain = await requireOwnedDomainBrain(locals, params.brainId);
		const formData = await request.formData();
		const domainGoal = String(formData.get('domainGoal') ?? '').trim();
		if (domainGoal === '') {
			return fail(400, { message: 'An expertise brain needs a goal — say what it should articulate.' });
		}
		await updateDomainBrainGoal(locals.supabase, brain.id, domainGoal);
		return {};
	},
	deleteDomainBrain: async ({ locals, params }) => {
		const brain = await requireOwnedDomainBrain(locals, params.brainId);
		await deleteDomainBrain(locals.supabase, brain.id);
		redirect(303, knowledgeBaseHref(params.knowledgeBaseId));
	}
};

async function requireOwnedDomainBrain(locals: App.Locals, brainId: string): Promise<DomainBrain> {
	const user = await requireUser(locals);
	const storedBrain = await getKbBrain(locals.supabase, brainId);
	if (storedBrain === null) error(404, 'That brain is not in this knowledge base');
	const brain = await requireDomainBrain(locals.supabase, storedBrain);
	if (brain.ownerId !== user.id) error(403, 'Only the owner can change this expertise brain');
	return brain;
}
