import { getBrainContexts } from './getBrainContexts';
import { getBrainPageIndex } from './getBrainPageIndex';
import { hasChanges } from './parseRememberRecord';
import { rememberFromChat } from './rememberFromChat';
import { proposeChatCorrection, type ChatProposer } from '$lib/server/sharing/proposeChatCorrection';
import { rememberedReply } from '$lib/server/sharing/rememberedReply';
import type { BrainAnswer, BrainConversationTurn } from '$lib/data/brainConversationTypes';
import type { DomainBrain } from '$lib/server/entities/getDomainBrain';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function rememberInBrainChat(
	supabase: SupabaseClient,
	service: SupabaseClient,
	brain: DomainBrain,
	proposer: ChatProposer,
	turns: BrainConversationTurn[]
): Promise<BrainAnswer> {
	const contexts = await getBrainContexts(supabase, brain.id);
	const index = await getBrainPageIndex(supabase, brain.id);
	const record = await rememberFromChat(supabase, brain, contexts, index, turns);
	const proposedCount = hasChanges(record)
		? await proposeChatCorrection(service, brain.id, proposer, record)
		: 0;
	return { answerMarkdown: rememberedReply(record, proposedCount), citedSlugs: [] };
}
