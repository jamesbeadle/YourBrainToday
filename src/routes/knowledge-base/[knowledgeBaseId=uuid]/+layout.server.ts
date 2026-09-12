import { error } from '@sveltejs/kit';
import { getChatbotsForKnowledgeBase } from '$lib/server/chatbots/getChatbotsForKnowledgeBase';
import { findPrimaryExpertiseBrain } from '$lib/server/knowledge/interviewContext';
import { getKbBrains } from '$lib/server/knowledge/getKbBrains';
import { getKnowledgeBase } from '$lib/server/knowledge/getKnowledgeBase';
import { getProcessMaps } from '$lib/server/knowledge/getProcessMaps';
import { getKnowledgeBaseShares } from '$lib/server/knowledge/knowledgeBaseShares';
import { loadKbWorkbenchData, type KbWorkbenchData } from '$lib/server/knowledge/kbWorkbenchData';
import { requireUser } from '$lib/server/auth/requireUser';
import type { LayoutServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const user = await requireUser(locals);
	const knowledgeBase = await getKnowledgeBase(locals.supabase, params.knowledgeBaseId);
	if (knowledgeBase === null) error(404, 'That knowledge base is not yours to open');
	const isOwner = knowledgeBase.ownerId === user.id;
	const [brains, processMaps, shares, chatbots, workbench] = await Promise.all([
		getKbBrains(locals.supabase, knowledgeBase.id),
		getProcessMaps(locals.supabase, knowledgeBase.id),
		isOwner ? getKnowledgeBaseShares(locals.supabase, knowledgeBase.id) : [],
		isOwner ? getChatbotsForKnowledgeBase(locals.supabase, knowledgeBase.id) : [],
		loadWorkbench(locals.supabase, knowledgeBase.id, isOwner)
	]);
	return { knowledgeBase, isOwner, brains, processMaps, shares, chatbots, workbench };
};

async function loadWorkbench(
	supabase: SupabaseClient,
	knowledgeBaseId: string,
	isOwner: boolean
): Promise<KbWorkbenchData> {
	const primary = await findPrimaryExpertiseBrain(supabase, knowledgeBaseId);
	return loadKbWorkbenchData(supabase, primary, isOwner);
}
