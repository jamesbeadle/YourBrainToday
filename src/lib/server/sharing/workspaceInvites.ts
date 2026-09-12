import type { SupabaseClient } from '@supabase/supabase-js';
import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
import type { ReceivedInvite, ShareScope, WorkspaceInvite } from '$lib/data/sharingTypes';

export async function createWorkspaceInvite(
	supabase: SupabaseClient,
	invite: {
		invitedEmail: string;
		invitedByEmail: string;
		scope: ShareScope;
		targetId: string;
		targetName: string;
	}
): Promise<'created' | 'already_invited'> {
	await clearDeclinedInvite(supabase, invite.invitedEmail, invite.scope, invite.targetId);
	const { error } = await supabase.from('workspace_invites').insert({
		invited_email: invite.invitedEmail,
		invited_by_email: invite.invitedByEmail,
		entity_id: invite.scope === 'entity' ? invite.targetId : null,
		brain_id: invite.scope === 'brain' ? invite.targetId : null,
		target_name: invite.targetName
	});
	if (error === null) return 'created';
	if (error.code === '23505') return 'already_invited';
	throw error;
}

export async function getInvitesForBrain(
	supabase: SupabaseClient,
	brain: DomainBrain
): Promise<WorkspaceInvite[]> {
	const { data, error } = await supabase
		.from('workspace_invites')
		.select('id, invited_email, entity_id, brain_id, declined_at, created_at')
		.is('claimed_at', null)
		.or(`brain_id.eq.${brain.id},entity_id.eq.${brain.entityId}`)
		.order('created_at');
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		id: row.id,
		invitedEmail: row.invited_email,
		scope: row.brain_id === null ? 'entity' : 'brain',
		status: row.declined_at === null ? 'pending' : 'declined',
		createdAt: row.created_at
	}));
}

export async function getReceivedInvites(
	supabase: SupabaseClient,
	userEmail: string
): Promise<ReceivedInvite[]> {
	if (userEmail === '') return [];
	const { data, error } = await supabase
		.from('workspace_invites')
		.select('id, invited_by_email, target_name, entity_id, brain_id, created_at')
		.ilike('invited_email', userEmail)
		.is('claimed_at', null)
		.is('declined_at', null)
		.order('created_at');
	if (error !== null) throw error;
	return (data ?? []).map((row) => ({
		id: row.id,
		invitedByEmail: row.invited_by_email,
		targetName: row.target_name,
		scope: row.brain_id === null ? 'entity' : 'brain'
	}));
}

export async function deleteWorkspaceInvite(
	supabase: SupabaseClient,
	inviteId: string
): Promise<void> {
	const { error } = await supabase.from('workspace_invites').delete().eq('id', inviteId);
	if (error !== null) throw error;
}

async function clearDeclinedInvite(
	supabase: SupabaseClient,
	invitedEmail: string,
	scope: ShareScope,
	targetId: string
): Promise<void> {
	const { error } = await supabase
		.from('workspace_invites')
		.delete()
		.ilike('invited_email', invitedEmail)
		.eq(scope === 'entity' ? 'entity_id' : 'brain_id', targetId)
		.not('declined_at', 'is', null);
	if (error !== null) throw error;
}
