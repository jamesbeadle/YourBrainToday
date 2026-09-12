import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrainChangeProposal } from '$lib/data/sharingTypes';

const proposalColumns =
	'id, proposer_email, source_id, source_filename, change_kind, slug, title, payload, before, status, created_at';

export async function getPendingProposals(
	supabase: SupabaseClient,
	brainId: string
): Promise<BrainChangeProposal[]> {
	const { data, error } = await supabase
		.from('brain_change_proposals')
		.select(proposalColumns)
		.eq('brain_id', brainId)
		.eq('status', 'pending')
		.order('created_at');
	if (error !== null) throw error;
	return (data ?? []).map(asProposal);
}

export async function getPendingProposalsByIds(
	supabase: SupabaseClient,
	brainId: string,
	proposalIds: string[]
): Promise<BrainChangeProposal[]> {
	if (proposalIds.length === 0) return [];
	const { data, error } = await supabase
		.from('brain_change_proposals')
		.select(proposalColumns)
		.eq('brain_id', brainId)
		.eq('status', 'pending')
		.in('id', proposalIds);
	if (error !== null) throw error;
	return (data ?? []).map(asProposal);
}

function asProposal(row: Record<string, unknown>): BrainChangeProposal {
	return {
		id: String(row.id),
		proposerEmail: String(row.proposer_email),
		sourceId: row.source_id === null ? null : String(row.source_id),
		sourceFilename: String(row.source_filename),
		changeKind: row.change_kind as BrainChangeProposal['changeKind'],
		slug: String(row.slug),
		title: String(row.title),
		payload: (row.payload ?? {}) as Record<string, unknown>,
		before: row.before as Record<string, unknown> | null,
		status: row.status as BrainChangeProposal['status'],
		createdAt: String(row.created_at)
	};
}
