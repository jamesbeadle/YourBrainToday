import { error, json } from '@sveltejs/kit';
import { createBrainApiToken, revokeBrainApiToken } from '$lib/server/brainApi/brainApiTokens';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to manage API tokens');

	const payload = await request.json();
	const brainId = readText(payload.brainId);
	const name = readText(payload.name);
	if (brainId === '') error(400, 'A expertise brain is required');
	if (name === '') error(400, 'Give the token a name so you can recognise it later');

	const brain = await getDomainBrain(locals.supabase, brainId);
	if (brain === null || brain.ownerId !== user.id) {
		error(403, 'Only the owner can create API tokens for this expertise brain');
	}
	const minted = await createBrainApiToken(locals.supabase, brainId, name);
	return json(minted);
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to manage API tokens');

	const payload = await request.json();
	const tokenId = readText(payload.tokenId);
	if (tokenId === '') error(400, 'A token is required');
	await revokeBrainApiToken(locals.supabase, tokenId);
	return json({ isRevoked: true });
};

function readText(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}
