import { error, json } from '@sveltejs/kit';
import { createBrainConversation } from '$lib/server/brain/createBrainConversation';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to talk to your expertise brain');
	const brain = await getDomainBrain(locals.supabase, await readBrainId(request));
	if (brain === null) error(404, 'That expertise brain could not be found');
	const conversationId = await createBrainConversation(locals.supabase, brain.id, 'brain');
	return json({ conversationId });
};

async function readBrainId(request: Request): Promise<string> {
	const payload = await request.json();
	const brainId = typeof payload.brainId === 'string' ? payload.brainId : '';
	if (brainId === '') error(400, 'A expertise brain is required');
	return brainId;
}
