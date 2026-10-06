import { askModeller } from './askModeller';
import { getBrainContexts } from './getBrainContexts';
import { getBrainPageIndex } from './getBrainPageIndex';
import { rememberInBrainChat } from './rememberInBrainChat';
import { isRememberRequest } from '$lib/data/rememberRequest';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { BrainAnswer, BrainConversationTurn } from '$lib/data/brainConversationTypes';
import type { ChatProposer } from '$lib/server/sharing/proposeChatCorrection';
import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function replyInBrainChat(
	supabase: SupabaseClient,
	brain: DomainBrain,
	speaker: ChatProposer,
	turns: BrainConversationTurn[]
): Promise<BrainAnswer> {
	const latest = turns[turns.length - 1];
	if (isRememberRequest(latest.text)) {
		return rememberInBrainChat(supabase, supabaseServiceClient(), brain, speaker, turns);
	}
	const contexts = await getBrainContexts(supabase, brain.id);
	const index = await getBrainPageIndex(supabase, brain.id);
	return askModeller(supabase, brain.id, contexts, index, turns);
}
