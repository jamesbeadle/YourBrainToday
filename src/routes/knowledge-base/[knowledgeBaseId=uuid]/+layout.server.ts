import { error } from '@sveltejs/kit';
import { getChatbotsForKnowledgeBase } from '$lib/server/chatbots/getChatbotsForKnowledgeBase';
import { findPrimaryExpertiseBrain } from '$lib/server/knowledge/interviewContext';
import { ensureHumanBrain } from '$lib/server/knowledge/ensureHumanBrain';
import { getKbBrains } from '$lib/server/knowledge/getKbBrains';
import { getKnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';
import { getProcessMaps } from '$lib/server/knowledge/getProcessMaps';
import { getKnowledgeBaseShares } from '$lib/server/knowledge/knowledgeBaseShares';
import { loadKbWorkbenchData, type KbWorkbenchData } from '$lib/server/knowledge/kbWorkbenchData';
import { requireUser } from '$lib/server/auth/requireUser';
import type { LayoutServerLoad } from './$types';
import type { KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const user = await requireUser(locals);
	const knowledgeBase = await getKnowledgeBase(locals.supabase, params.knowledgeBaseId);
	if (knowledgeBase === null) error(404, 'That knowledge base is not yours to open');
	const isOwner = knowledgeBase.ownerId === user.id;
	const [brains, processMaps, shares, chatbots, workbench] = await Promise.all([
		loadBrains(locals.supabase, knowledgeBase, isOwner),
		getProcessMaps(locals.supabase, knowledgeBase.id),
		isOwner ? getKnowledgeBaseShares(locals.supabase, knowledgeBase.id) : [],
		isOwner ? getChatbotsForKnowledgeBase(locals.supabase, knowledgeBase.id) : [],
		loadWorkbench(locals.supabase, knowledgeBase.id, isOwner)
	]);
	return { knowledgeBase, isOwner, brains, processMaps, shares, chatbots, workbench };
};

async function loadBrains(
	supabase: SupabaseClient,
	knowledgeBase: { id: string; name: string },
	isOwner: boolean
): Promise<KbBrainSummary[]> {
	const brains = await getKbBrains(supabase, knowledgeBase.id);
	if (!isOwner) return brains;
	const wasHumanBrainAdded = await ensureHumanBrain(supabase, knowledgeBase, brains);
	if (!wasHumanBrainAdded) return brains;
	return getKbBrains(supabase, knowledgeBase.id);
}

async function loadWorkbench(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	isOwner: boolean
): Promise<KbWorkbenchData> {
	const primary = await findPrimaryExpertiseBrain(supabase, knowledgeBaseId);
	return loadKbWorkbenchData(supabase, primary, isOwner);
}
