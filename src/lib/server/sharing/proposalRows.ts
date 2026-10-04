import { getBrainContexts } from '$lib/server/brain/getBrainContexts';
import { getBrainPagesBySlugs } from '$lib/server/brain/getBrainPage';
import type { BrainContextWrite } from '$lib/server/brain/saveBrainContextWrites';
import type { BrainPageWrite } from '$lib/server/brain/saveBrainPageWrites';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ProposalOrigin = {
	brainId: string;
	proposerEmail: string;
	proposerId?: string;
	sourceId: string | null;
	sourceFilename: string;
};

export type ProposedWrites = {
	contextWrites: BrainContextWrite[];
	pageWrites: BrainPageWrite[];
};

export async function proposalRowsFor(
	supabase: SupabaseClient,
	origin: ProposalOrigin,
	writes: ProposedWrites
) {
	return [
		...(await contextProposalRows(supabase, origin, writes.contextWrites)),
		...(await pageProposalRows(supabase, origin, writes.pageWrites))
	];
}

async function contextProposalRows(
	supabase: SupabaseClient,
	origin: ProposalOrigin,
	writes: BrainContextWrite[]
) {
	if (writes.length === 0) return [];
	const contexts = await getBrainContexts(supabase, origin.brainId);
	return writes.map((write) => ({
		...originColumns(origin),
		change_kind: 'context_write',
		slug: write.slug,
		title: write.name,
		payload: write,
		before: contexts.find((context) => context.slug === write.slug) ?? null
	}));
}

async function pageProposalRows(
	supabase: SupabaseClient,
	origin: ProposalOrigin,
	writes: BrainPageWrite[]
) {
	if (writes.length === 0) return [];
	const slugs = writes.map((write) => write.slug);
	const beforePages = await getBrainPagesBySlugs(supabase, origin.brainId, slugs);
	return writes.map((write) => ({
		...originColumns(origin),
		change_kind: 'page_write',
		slug: write.slug,
		title: write.title,
		payload: write,
		before: beforePages.find((page) => page.slug === write.slug) ?? null
	}));
}

function originColumns(origin: ProposalOrigin) {
	const proposer = origin.proposerId === undefined ? {} : { proposer_id: origin.proposerId };
	return {
		brain_id: origin.brainId,
		proposer_email: origin.proposerEmail,
		source_id: origin.sourceId,
		source_filename: origin.sourceFilename,
		...proposer
	};
}
