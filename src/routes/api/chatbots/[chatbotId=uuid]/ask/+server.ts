import { error, json } from '@sveltejs/kit';
import { askChatbot, type ChatbotTurn } from '$lib/server/chatbots/askChatbot';
import { chatbotRefusalFor, notAMemberRefusal } from '$lib/server/chatbots/chatbotRefusals';
import { getChatbot } from '$lib/server/chatbots/getChatbot';
import { getChatbotConversation } from '$lib/server/chatbots/getChatbotConversation';
import { getChatbotKnowledge } from '$lib/server/chatbots/getChatbotKnowledge';
import { getChatbotMembership } from '$lib/server/chatbots/getChatbotMembership';
import { longestQuestion } from '$lib/data/questionLimits';
import { questionFloorCreditsFor } from '$lib/data/creditPricing';
import { recordChatbotTurn } from '$lib/server/chatbots/recordChatbotTurn';
import { recordKnowledgeGap } from '$lib/server/chatbots/recordKnowledgeGap';
import { requireMemberQuestionHeadroom } from '$lib/server/chatbots/requireMemberQuestionHeadroom';
import {
	refundForChatbotQuestion,
	settleChatbotQuestion
} from '$lib/server/chatbots/settleChatbotQuestion';
import { spendForChatbotQuestion } from '$lib/server/chatbots/spendForChatbotQuestion';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { ChatbotAnswer } from '$lib/data/chatbotTypes';
import type { RequestHandler } from './$types';

const longestRememberedExchange = 12;

export const config = { maxDuration: 300 };

export const POST: RequestHandler = async ({ request, params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to ask');
	const chatbot = await getChatbot(locals.supabase, params.chatbotId);
	if (chatbot === null) error(404, 'That bot does not exist');
	const question = readQuestion(await request.json().catch(() => ({})));
	const membership = await getChatbotMembership(locals.supabase, chatbot.id, user.id, chatbot.modelId);
	if (membership === null) error(notAMemberRefusal.status, notAMemberRefusal.message);
	await requireMemberQuestionHeadroom(locals.supabase, user.id);

	// The spend RPC is the membership check proper: it runs as the service
	// role with the member named by the session, so nothing is read or
	// written on the member's behalf until it has passed.
	const service = supabaseServiceClient();
	const reserve = questionFloorCreditsFor(membership.modelId);
	const spend = await spendForChatbotQuestion(service, chatbot.id, user.id, reserve);
	if (typeof spend === 'string') {
		const refusal = await chatbotRefusalFor(service, chatbot, spend);
		error(refusal.status, refusal.message);
	}

	try {
		const conversation = await getChatbotConversation(locals.supabase, chatbot.id, user.id);
		const knowledge = await getChatbotKnowledge(service, chatbot.knowledgeBaseId);
		const priorTurns: ChatbotTurn[] = conversation.messages
			.slice(-longestRememberedExchange)
			.map((message) => ({ speaker: message.speaker, text: message.body }));
		const answer = await askChatbot(
			service,
			{ name: chatbot.name, modelId: membership.modelId },
			knowledge,
			[...priorTurns, { speaker: 'member', text: question }]
		);
		await recordChatbotTurn(service, conversation.id, question, answer);
		await noteKnowledgeGap(service, chatbot.id, user.id, question, answer);
		const settled = await settleChatbotQuestion(service, chatbot, user.id, reserve);
		return json({
			...answer,
			creditsCharged: reserve + settled,
			allowanceRemaining: spend.allowanceRemaining - settled
		});
	} catch (failure) {
		console.error('Chatbot question failed', failure);
		await refundForChatbotQuestion(service, chatbot, user.id, reserve);
		error(502, 'That question failed — nothing was taken from your allowance');
	}
};

// The gap is bookkeeping for the owner: failing to note it must never turn a
// delivered answer into a refund.
async function noteKnowledgeGap(
	service: ReturnType<typeof supabaseServiceClient>,
	chatbotId: string,
	memberId: string,
	question: string,
	answer: ChatbotAnswer
): Promise<void> {
	try {
		await recordKnowledgeGap(service, chatbotId, memberId, question, answer.missingKnowledge);
	} catch (failure) {
		console.error('Recording the knowledge gap failed', failure);
	}
}

function readQuestion(payload: { question?: unknown }): string {
	const question = typeof payload.question === 'string' ? payload.question.trim() : '';
	if (question === '') error(400, 'A question is required');
	return question.slice(0, longestQuestion);
}
