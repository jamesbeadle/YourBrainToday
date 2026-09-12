import { error, json } from '@sveltejs/kit';
import { createBrainSource } from '$lib/server/brain/createBrainSource';
import { fetchLinkedPage } from '$lib/server/brain/fetchLinkedPage';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to add links to your expertise brain');

	const payload = await request.json();
	const brainId = typeof payload.brainId === 'string' ? payload.brainId : '';
	const pageUrl = typeof payload.url === 'string' ? payload.url.trim() : '';
	if (brainId === '' || pageUrl === '') error(400, 'A expertise brain and a link are required');

	const brain = await getDomainBrain(locals.supabase, brainId);
	if (brain === null) error(404, 'That expertise brain could not be found');

	const page = await readLinkedPage(pageUrl);
	const text = `Source link: ${pageUrl}\n\n${page.text}`;
	const grant = await createBrainSource(locals.supabase, user.id, brain.id, {
		filename: page.title,
		mimeType: 'text/plain',
		byteCount: new TextEncoder().encode(text).length
	});
	await storePageText(grant.uploadUrl, text);
	return json({ sourceId: grant.sourceId, title: page.title });
};

async function readLinkedPage(pageUrl: string) {
	try {
		return await fetchLinkedPage(pageUrl);
	} catch (failure) {
		error(422, failure instanceof Error ? failure.message : 'That page could not be read');
	}
}

async function storePageText(uploadUrl: string, text: string): Promise<void> {
	const response = await fetch(uploadUrl, {
		method: 'PUT',
		headers: { 'content-type': 'text/plain' },
		body: text
	});
	if (!response.ok) throw new Error(`Storing the page failed with status ${response.status}`);
}
