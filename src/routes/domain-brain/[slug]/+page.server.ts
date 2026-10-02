import { error, redirect } from '@sveltejs/kit';
import { findPageFiling } from '$lib/server/knowledge/explorer/findPageFiling';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PageServerLoad } from './$types';

/** The modeller's own page links name only a slug; the reader lives wherever that page is filed. */
export const load: PageServerLoad = async ({ locals, params }) => {
	await requireUser(locals);
	const readerHref = await findPageFiling(locals.supabase, params.slug);
	if (readerHref === null) error(404, 'No page with that name is yours to read');
	redirect(307, readerHref);
};
