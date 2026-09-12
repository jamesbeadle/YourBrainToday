import { getBrainApiTokens } from '$lib/server/brainApi/brainApiTokens';
import { getBrainEvents } from '$lib/server/brain/getBrainEvents';
import { getBrainSources } from '$lib/server/brain/getBrainSources';
import { getDomainBrain, type DomainBrain } from '$lib/server/entities/getDomainBrain';
import { getPendingProposals } from '$lib/server/sharing/getPendingProposals';
import type { BrainChangeProposal } from '$lib/data/sharingTypes';
import type { BrainApiToken } from '$lib/data/brainApiTypes';
import type { BrainEvent, BrainSource } from '$lib/data/brainTypes';
import type { PrimaryExpertiseBrain } from './interviewContext';
import type { SupabaseClient } from '@supabase/supabase-js';

export type KbWorkbenchData = {
	primaryBrain: DomainBrain | null;
	sources: BrainSource[];
	events: BrainEvent[];
	proposals: BrainChangeProposal[];
	apiTokens: BrainApiToken[];
};

const emptyWorkbench: KbWorkbenchData = {
	primaryBrain: null,
	sources: [],
	events: [],
	proposals: [],
	apiTokens: []
};

export async function loadKbWorkbenchData(
	supabase: SupabaseClient,
	primary: PrimaryExpertiseBrain | null,
	isOwner: boolean
): Promise<KbWorkbenchData> {
	if (primary === null) return emptyWorkbench;
	const primaryBrain = await getDomainBrain(supabase, primary.domainBrainId);
	if (primaryBrain === null) return emptyWorkbench;
	return {
		primaryBrain,
		sources: await getBrainSources(supabase, primaryBrain.id),
		events: await getBrainEvents(supabase, primaryBrain.id),
		proposals: isOwner ? await getPendingProposals(supabase, primaryBrain.id) : [],
		apiTokens: isOwner ? await getBrainApiTokens(supabase, primaryBrain.id) : []
	};
}
