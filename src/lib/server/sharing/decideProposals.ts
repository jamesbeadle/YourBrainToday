import { applyApprovedProposals } from './applyApprovedProposals';
import { getPendingProposalsByIds } from './getPendingProposals';
import { markSourceStatus } from '$lib/server/brain/findBrainSource';
import { recordBrainEvent } from '$lib/server/brain/recordBrainEvent';
import type { BrainChangeProposal } from '$lib/data/sharingTypes';
import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function decideProposals(
	supabase: SupabaseClient,
	brain: DomainBrain,
	approvedIds: string[],
	rejectedIds: string[]
): Promise<void> {
	const approved = await getPendingProposalsByIds(supabase, brain.id, approvedIds);
	const rejected = await getPendingProposalsByIds(supabase, brain.id, rejectedIds);
	await applyApprovedProposals(supabase, brain.id, approved);
	await markDecided(supabase, approved, 'approved');
	await markDecided(supabase, rejected, 'rejected');
	await settleSourceStatuses(supabase, [...approved, ...rejected]);
	await recordDecisionEvents(supabase, brain.id, approved, rejected);
}

async function markDecided(
	supabase: SupabaseClient,
	proposals: BrainChangeProposal[],
	status: 'approved' | 'rejected'
): Promise<void> {
	if (proposals.length === 0) return;
	const { error } = await supabase
		.from('brain_change_proposals')
		.update({ status, decided_at: new Date().toISOString() })
		.in(
			'id',
			proposals.map((proposal) => proposal.id)
		);
	if (error !== null) throw error;
}

async function settleSourceStatuses(
	supabase: SupabaseClient,
	decided: BrainChangeProposal[]
): Promise<void> {
	const sourceIds = [...new Set(decided.map((proposal) => proposal.sourceId))];
	for (const sourceId of sourceIds) {
		if (sourceId !== null) await settleOneSource(supabase, sourceId);
	}
}

async function settleOneSource(supabase: SupabaseClient, sourceId: string): Promise<void> {
	const { data, error } = await supabase
		.from('brain_change_proposals')
		.select('status')
		.eq('source_id', sourceId);
	if (error !== null) throw error;
	const statuses = (data ?? []).map((row) => row.status);
	if (statuses.includes('pending')) return;
	const outcome = statuses.includes('approved') ? 'ingested' : 'rejected';
	await markSourceStatus(supabase, sourceId, outcome);
}

async function recordDecisionEvents(
	supabase: SupabaseClient,
	brainId: string,
	approved: BrainChangeProposal[],
	rejected: BrainChangeProposal[]
): Promise<void> {
	if (approved.length > 0) {
		await recordBrainEvent(supabase, {
			brainId,
			kind: 'changes_approved',
			detail: { changeCount: approved.length, slugs: approved.map((proposal) => proposal.slug) }
		});
	}
	if (rejected.length > 0) {
		await recordBrainEvent(supabase, {
			brainId,
			kind: 'changes_rejected',
			detail: { changeCount: rejected.length, slugs: rejected.map((proposal) => proposal.slug) }
		});
	}
}
