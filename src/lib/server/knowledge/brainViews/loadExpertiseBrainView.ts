import { error } from '@sveltejs/kit';
import { getBrainContexts } from '$lib/server/brain/getBrainContexts';
import { getBrainConversationThread } from '$lib/server/brain/getBrainConversation';
import { getBrainPageIndex } from '$lib/server/brain/getBrainPageIndex';
import { getBrainPageLinks } from '$lib/server/brain/getBrainPageLinks';
import { getDomainBrain, type DomainBrain } from '$lib/server/entities/getDomainBrain';
import { resolveBrainAccessRole } from '$lib/server/market/resolveBrainAccessRole';
import type { BrainAccessRole } from '$lib/data/marketTypes';
import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
import type {
	BrainContext,
	BrainConversationThread,
	BrainPageLink,
	BrainPageSummary
} from '$lib/data/brainTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ExpertiseBrainView = {
	kind: 'expertise';
	brain: DomainBrain;
	accessRole: BrainAccessRole;
	contexts: BrainContext[];
	pageIndex: BrainPageSummary[];
	pageLinks: BrainPageLink[];
	conversation: BrainConversationThread;
};

export async function loadExpertiseBrainView(
	supabase: SupabaseClient,
	storedBrain: KbBrainSummary,
	userId: string
): Promise<ExpertiseBrainView> {
	const brain = await requireDomainBrain(supabase, storedBrain);
	const [accessRole, contexts, pageIndex, pageLinks, conversation] = await Promise.all([
		resolveBrainAccessRole(supabase, brain, userId),
		getBrainContexts(supabase, brain.id),
		getBrainPageIndex(supabase, brain.id),
		getBrainPageLinks(supabase, brain.id),
		getBrainConversationThread(supabase, brain.id, 'brain')
	]);
	return { kind: 'expertise', brain, accessRole, contexts, pageIndex, pageLinks, conversation };
}

export async function requireDomainBrain(
	supabase: SupabaseClient,
	storedBrain: KbBrainSummary
): Promise<DomainBrain> {
	const brain =
		storedBrain.domainBrainId === null
			? null
			: await getDomainBrain(supabase, storedBrain.domainBrainId);
	if (brain === null) error(404, 'That expertise brain has no model behind it');
	return brain;
}
