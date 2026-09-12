import { exportDomainBrain } from '$lib/server/brain/exportDomainBrain';
import { recordBrainEvent } from '$lib/server/brain/recordBrainEvent';
import { resolveApiCaller } from '$lib/server/brainApi/resolveApiCaller';
import type { RequestHandler } from './$types';

const exportFilename = 'domain-brain.zip';

export const GET: RequestHandler = async ({ request, params }) => {
	const { supabase, brain } = await resolveApiCaller(request, params.brainId);
	const zipBytes = await exportDomainBrain(supabase, brain.id);
	await recordBrainEvent(supabase, {
		brainId: brain.id,
		kind: 'brain_exported',
		detail: { exportedThrough: 'api' }
	});
	return new Response(new Uint8Array(zipBytes), {
		headers: {
			'content-type': 'application/zip',
			'content-disposition': `attachment; filename="${exportFilename}"`
		}
	});
};
