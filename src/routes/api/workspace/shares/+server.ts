import { error, json } from '@sveltejs/kit';
import { createWorkspaceInvite, deleteWorkspaceInvite } from '$lib/server/sharing/workspaceInvites';
import { deleteWorkspaceShare } from '$lib/server/sharing/createWorkspaceShare';
import { countWorkspaceInvitesThisHour } from '$lib/server/sharing/recentWorkspaceInviteCount';
import { inviteEmailSubject, renderInviteEmail } from '$lib/server/email/inviteEmail';
import { isInviteAllowanceSpent, tooManyInvitesMessage } from '$lib/server/email/inviteAllowance';
import { sendTransactionalEmail } from '$lib/server/email/sendTransactionalEmail';
import { verifyShareTarget } from '$lib/server/sharing/verifyShareTarget';
import type { EmailDelivery } from '$lib/data/emailDelivery';
import type { RequestHandler } from './$types';
import type { ShareScope } from '$lib/data/sharingTypes';

export const POST: RequestHandler = async ({ locals, request, url }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to share your workspace');

	const payload = await request.json();
	const { scope, targetId } = readTarget(payload);
	const email = typeof payload.email === 'string' ? payload.email.trim() : '';
	if (email === '') error(400, 'An email is required');
	if (email.toLowerCase() === (user.email ?? '').toLowerCase()) {
		error(400, 'That is your own account');
	}

	const target = await verifyShareTarget(locals.supabase, user.id, scope, targetId);
	if (target === null) error(404, 'Only the owner can share this');
	const invitesThisHour = await countWorkspaceInvitesThisHour(locals.supabase, user.id);
	if (isInviteAllowanceSpent(invitesThisHour)) error(429, tooManyInvitesMessage);

	const outcome = await createWorkspaceInvite(locals.supabase, {
		invitedEmail: email,
		invitedByEmail: user.email ?? '',
		scope,
		targetId,
		targetName: target.name
	});
	if (outcome === 'already_invited') error(409, 'That address is already invited');
	const emailDelivery = await deliverInvite(email, user.email ?? '', target.name, url.origin);
	return json({ isInvited: true, emailDelivery });
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to manage your shares');

	const payload = await request.json();
	if (typeof payload.shareId === 'string' && payload.shareId !== '') {
		await deleteWorkspaceShare(locals.supabase, payload.shareId);
		return json({ isRemoved: true });
	}
	if (typeof payload.inviteId === 'string' && payload.inviteId !== '') {
		await deleteWorkspaceInvite(locals.supabase, payload.inviteId);
		return json({ isRemoved: true });
	}
	error(400, 'A share or an invite is required');
};

async function deliverInvite(
	invitedEmail: string,
	inviterEmail: string,
	workspaceName: string,
	origin: string
): Promise<EmailDelivery> {
	const signInUrl = `${origin}/account/sign-in?invited=1&by=${encodeURIComponent(inviterEmail)}`;
	return sendTransactionalEmail({
		to: invitedEmail,
		subject: inviteEmailSubject(inviterEmail),
		html: renderInviteEmail(inviterEmail, workspaceName, signInUrl)
	});
}

function readTarget(payload: Record<string, unknown>): { scope: ShareScope; targetId: string } {
	if (typeof payload.brainId === 'string' && payload.brainId !== '') {
		return { scope: 'brain', targetId: payload.brainId };
	}
	if (typeof payload.entityId === 'string' && payload.entityId !== '') {
		return { scope: 'entity', targetId: payload.entityId };
	}
	error(400, 'A brain or an entity is required');
}
