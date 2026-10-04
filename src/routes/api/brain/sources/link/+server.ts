import { error, json } from '@sveltejs/kit';
import { createBrainSource } from '$lib/server/brain/createBrainSource';
import { linkedSourceMimeType } from '$lib/server/brain/links/linkLimits';
import { readLinkedSource } from '$lib/server/brain/links/readLinkedSource';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import { isAcceptedUpload, uploadLimitDescription } from '$lib/data/brainUploadRules';
import type { LinkedSource } from '$lib/server/brain/links/linkedSource';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 120 };

const unprocessable = 422;

/** Reads a link into a source the brain can then study, exactly as an uploaded document. */
export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to add links to your expertise brain');

	const payload = await request.json();
	const brainId = typeof payload.brainId === 'string' ? payload.brainId : '';
	const link = typeof payload.url === 'string' ? payload.url.trim() : '';
	if (brainId === '' || link === '') error(400, 'An expertise brain and a link are required');

	const brain = await getDomainBrain(locals.supabase, brainId);
	if (brain === null) error(404, 'That expertise brain could not be found');

	const linked = await readLink(link);
	const byteCount = new TextEncoder().encode(linked.text).length;
	if (!isAcceptedUpload(linkedSourceMimeType, byteCount)) {
		error(unprocessable, `That link holds too much text to read at once. ${uploadLimitDescription()}`);
	}
	const grant = await createBrainSource(locals.supabase, user.id, brain.id, {
		filename: linked.title,
		mimeType: linkedSourceMimeType,
		byteCount
	});
	await storeLinkedText(grant.uploadUrl, linked.text);
	return json({ sourceId: grant.sourceId, title: linked.title });
};

async function readLink(link: string): Promise<LinkedSource> {
	try {
		return await readLinkedSource(link);
	} catch (failure) {
		error(unprocessable, failure instanceof Error ? failure.message : 'That link could not be read');
	}
}

async function storeLinkedText(uploadUrl: string, text: string): Promise<void> {
	const response = await fetch(uploadUrl, {
		method: 'PUT',
		headers: { 'content-type': linkedSourceMimeType },
		body: text
	});
	if (!response.ok) throw new Error(`Storing the link failed with status ${response.status}`);
}
