import { error, json } from '@sveltejs/kit';
import { decideProposals } from '$lib/server/sharing/decideProposals';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to review changes');

	const payload = await request.json();
	const brain = await getDomainBrain(locals.supabase, readText(payload.brainId));
	if (brain === null) error(404, 'That expertise brain could not be found');
	if (brain.ownerId !== user.id) error(403, 'Only the owner reviews changes');

	const approvedIds = readIds(payload.approvedIds);
	const rejectedIds = readIds(payload.rejectedIds);
	if (approvedIds.length === 0 && rejectedIds.length === 0) {
		error(400, 'Nothing was selected');
	}
	await decideProposals(locals.supabase, brain, approvedIds, rejectedIds);
	return json({ isDecided: true });
};

function readText(candidate: unknown): string {
	return typeof candidate === 'string' ? candidate : '';
}

function readIds(candidate: unknown): string[] {
	if (!Array.isArray(candidate)) return [];
	return candidate.filter((entry): entry is string => typeof entry === 'string');
}
