import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Shared process maps now appear on the workspace under "Shared with you" —
// this old listing page just forwards anyone with a stale link.
export const load: PageServerLoad = async () => {
	redirect(301, '/knowledge-base');
};
