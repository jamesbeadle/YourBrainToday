import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const decisionFunctions = {
	accept: 'accept_workspace_invite',
	decline: 'decline_workspace_invite'
} as const;

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to answer your invitations');

	const payload = await request.json();
	const inviteId = typeof payload.inviteId === 'string' ? payload.inviteId : '';
	const decision = readDecision(payload.decision);
	if (inviteId === '' || decision === null) error(400, 'An invite and a decision are required');

	const { error: decisionFailure } = await locals.supabase.rpc(decisionFunctions[decision], {
		invite_identifier: inviteId
	});
	if (decisionFailure !== null) {
		if (decisionFailure.message.includes('unknown_invite')) {
			error(404, 'That invitation is no longer open');
		}
		throw decisionFailure;
	}
	return json({ decision });
};

function readDecision(candidate: unknown): keyof typeof decisionFunctions | null {
	if (candidate === 'accept' || candidate === 'decline') return candidate;
	return null;
}
