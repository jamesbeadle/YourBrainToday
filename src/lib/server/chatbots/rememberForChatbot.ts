import { findPrimaryExpertiseBrain } from '../knowledge/interviewContext';
import { getBrainContexts } from '../brain/getBrainContexts';
import { getBrainPageIndex } from '../brain/getBrainPageIndex';
import { getDomainBrain } from '../entities/getDomainBrain';
import { hasChanges } from '../brain/parseRememberRecord';
import { rememberFromChat } from '../brain/rememberFromChat';
import { proposeChatCorrection, type ChatProposer } from '../sharing/proposeChatCorrection';
import { rememberedReply } from '../sharing/rememberedReply';
import type { ChatbotTurn } from './askChatbot';
import type { ChatbotAnswer } from '$lib/data/chatbotTypes';
import type { BrainConversationTurn } from '$lib/data/brainConversationTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const noExpertiseBrainReply =
	'This knowledge base has no expertise brain yet, so there is nowhere for me to keep that. ' +
	'Tell whoever looks after it.';

export async function rememberForChatbot(
	service: SupabaseClient,
	chatbot: { knowledgeBaseId: string; modelId: string },
	member: ChatProposer,
	turns: ChatbotTurn[]
): Promise<ChatbotAnswer> {
	const primary = await findPrimaryExpertiseBrain(service, chatbot.knowledgeBaseId);
	const brain = primary === null ? null : await getDomainBrain(service, primary.domainBrainId);
	if (brain === null) return reply(noExpertiseBrainReply);
	const contexts = await getBrainContexts(service, brain.id);
	const index = await getBrainPageIndex(service, brain.id);
	const brainTurns = turns.map(asBrainTurn);
	const record = await rememberFromChat(service, brain, contexts, index, brainTurns, chatbot.modelId);
	const proposedCount = hasChanges(record)
		? await proposeChatCorrection(service, brain.id, member, record)
		: 0;
	return reply(rememberedReply(record, proposedCount));
}

function asBrainTurn(turn: ChatbotTurn): BrainConversationTurn {
	return { speaker: turn.speaker === 'member' ? 'user' : 'modeller', text: turn.text };
}

function reply(answerMarkdown: string): ChatbotAnswer {
	return { answerMarkdown, citedPageKeys: [], missingKnowledge: null };
}
