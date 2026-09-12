import { error, fail, redirect } from '@sveltejs/kit';
import { createDomainBrain } from '$lib/server/entities/createDomainBrain';
import { getEntity } from '$lib/server/entities/getEntity';
import { requireUser } from '$lib/server/auth/requireUser';
import type { Actions, PageServerLoad, PageServerLoadEvent } from './$types';

export const load: PageServerLoad = async (event) => {
	redirect(307, '/knowledge-base');
	return loadEntity(event);
};

async function loadEntity({ locals, params }: PageServerLoadEvent) {
	await requireUser(locals);
	const entity = await getEntity(locals.supabase, params.entityId);
	if (entity === null) error(404, 'That business could not be found');
	return { entity };
}

export const actions: Actions = {
	createDomainBrain: async ({ locals, params, request }) => {
		redirect(307, '/knowledge-base');
		await requireUser(locals);
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const domainGoal = String(formData.get('domainGoal') ?? '').trim();
		if (name === '') return fail(400, { message: 'An expertise brain needs a name.' });
		if (domainGoal === '') {
			return fail(400, {
				message: 'An expertise brain needs a goal — say what domain it should articulate.'
			});
		}
		const brainId = await createDomainBrain(locals.supabase, params.entityId, name, domainGoal);
		redirect(303, `/workspace/${params.entityId}/domains/${brainId}`);
	}
};
