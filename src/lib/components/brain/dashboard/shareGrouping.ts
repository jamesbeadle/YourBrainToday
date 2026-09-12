import type { ShareScope, WorkspaceInvite, WorkspaceShare } from '$lib/data/sharingTypes';

export type MergedGrant = { email: string; scope: ShareScope; ids: string[] };

export function mergedShareGrants(shares: WorkspaceShare[]): MergedGrant[] {
	return mergeByEmail(
		shares.map((share) => ({ id: share.id, email: share.collaboratorEmail, scope: share.scope }))
	);
}

export function mergedInviteGrants(invites: WorkspaceInvite[]): MergedGrant[] {
	return mergeByEmail(
		invites.map((invite) => ({ id: invite.id, email: invite.invitedEmail, scope: invite.scope }))
	);
}

function mergeByEmail(grants: { id: string; email: string; scope: ShareScope }[]): MergedGrant[] {
	const merged = new Map<string, MergedGrant>();
	for (const grant of grants) {
		const key = grant.email.toLowerCase();
		const existing = merged.get(key);
		if (existing === undefined) {
			merged.set(key, { email: grant.email, scope: grant.scope, ids: [grant.id] });
			continue;
		}
		existing.ids.push(grant.id);
		if (grant.scope === 'entity') existing.scope = 'entity';
	}
	return [...merged.values()];
}
