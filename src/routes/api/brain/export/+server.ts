import { error } from '@sveltejs/kit';
import { exportDomainBrain } from '$lib/server/brain/exportDomainBrain';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import { recordBrainEvent } from '$lib/server/brain/recordBrainEvent';
import type { RequestHandler } from './$types';

const exportFilename = 'domain-brain.zip';

export const GET: RequestHandler = async ({ locals, url }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to export your expertise brain');

	const brain = await getDomainBrain(locals.supabase, url.searchParams.get('brain') ?? '');
	if (brain === null) error(404, 'That expertise brain could not be found');
	if (brain.ownerId !== user.id) error(403, 'Only the owner can export this expertise brain');

	const zipBytes = await exportDomainBrain(locals.supabase, brain.id);
	await recordBrainEvent(locals.supabase, { brainId: brain.id, kind: 'brain_exported', detail: {} });
	return new Response(new Uint8Array(zipBytes), {
		headers: {
			'content-type': 'application/zip',
			'content-disposition': `attachment; filename="${exportFilename}"`
		}
	});
};
