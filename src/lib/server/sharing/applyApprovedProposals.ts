import { recordBrainEvent } from '$lib/server/brain/recordBrainEvent';
import { saveBrainContextWrites } from '$lib/server/brain/saveBrainContextWrites';
import { saveBrainPageWrites } from '$lib/server/brain/saveBrainPageWrites';
import type { BrainChangeProposal } from '$lib/data/sharingTypes';
import type { BrainContextWrite } from '$lib/server/brain/saveBrainContextWrites';
import type { BrainPageWrite } from '$lib/server/brain/saveBrainPageWrites';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function applyApprovedProposals(
	supabase: SupabaseClient,
	brainId: string,
	approved: BrainChangeProposal[]
): Promise<void> {
	const contextWrites = approved
		.filter((proposal) => proposal.changeKind === 'context_write')
		.map((proposal) => proposal.payload as BrainContextWrite);
	const pageProposals = approved.filter((proposal) => proposal.changeKind === 'page_write');
	const appliedContexts = await saveBrainContextWrites(supabase, brainId, contextWrites);
	const appliedPages = await saveBrainPageWrites(
		supabase,
		brainId,
		pageProposals.map((proposal) => proposal.payload as unknown as BrainPageWrite)
	);
	for (const applied of appliedContexts) {
		await recordBrainEvent(supabase, {
			brainId,
			kind: applied.wasCreated ? 'context_created' : 'context_updated',
			detail: { contextSlug: applied.slug }
		});
	}
	for (const applied of appliedPages) {
		await recordBrainEvent(supabase, {
			brainId,
			kind: applied.wasCreated ? 'page_created' : 'page_updated',
			detail: {},
			pageSlug: applied.slug,
			sourceId: sourceIdFor(pageProposals, applied.slug)
		});
	}
}

function sourceIdFor(proposals: BrainChangeProposal[], slug: string): string | undefined {
	return proposals.find((proposal) => proposal.slug === slug)?.sourceId ?? undefined;
}
