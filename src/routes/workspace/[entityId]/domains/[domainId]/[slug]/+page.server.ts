import { error } from '@sveltejs/kit';
import { getBrainContexts } from '$lib/server/brain/getBrainContexts';
import { getBrainPage } from '$lib/server/brain/getBrainPage';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireUser(locals);
	const brain = await getDomainBrain(locals.supabase, params.domainId);
	if (brain === null || brain.entityId !== params.entityId) {
		error(404, 'That expertise brain is not in this entity');
	}
	const page = await getBrainPage(locals.supabase, brain.id, params.slug);
	if (page === null) error(404, 'That page is not in this expertise brain');
	const contexts = await getBrainContexts(locals.supabase, brain.id);
	const context = contexts.find((candidate) => candidate.slug === page.contextSlug) ?? null;
	return { brain, page, contextName: context?.name ?? null };
};
