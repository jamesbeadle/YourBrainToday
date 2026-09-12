import { error, json } from '@sveltejs/kit';
import { askInterviewer, type InterviewTurnInput } from '$lib/server/knowledge/interviewAgent';
import type { InterviewFocus } from '$lib/server/knowledge/interviewPrompt';
import {
	buildInterviewContext,
	findPrimaryExpertiseBrain
} from '$lib/server/knowledge/interviewContext';
import { questionFloorCreditsFor } from '$lib/data/creditPricing';
import { resolveRequestModel } from '$lib/server/anthropic/resolveRequestModel';
import { settleQuestionUsage } from '$lib/server/credits/settleQuestionUsage';
import { fileHarvestToKnowledgeBase } from '$lib/server/agent/fileHarvestedKnowledge';
import { readInterviewRequest } from '$lib/server/knowledge/readInterviewRequest';
import { requireOwnedKnowledgeBase } from '$lib/server/knowledge/requireOwnedKnowledgeBase';
import { isAnthropicConfigured } from '$lib/server/anthropic/isAnthropicConfigured';
import { refundQuestionUsage } from '$lib/server/credits/refundQuestionUsage';
import { requireSpendHeadroom } from '$lib/server/credits/requireSpendHeadroom';
import { spendCredits } from '$lib/server/credits/spendCredits';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 300 };

const interviewSpendReason = 'kb_interview';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to be interviewed');
	if (!isAnthropicConfigured()) error(503, 'The interviewer is offline right now — try again shortly');

	const { knowledgeBaseId, conversation, focus } = await readInterviewRequest(request);
	const knowledgeBase = await requireOwnedKnowledgeBase(locals.supabase, knowledgeBaseId, user.id);
	await requireSpendHeadroom(locals.supabase, user.id);

	const reserve = questionFloorCreditsFor(await resolveRequestModel());
	const spend = await spendCredits(locals.supabase, reserve, interviewSpendReason);
	if (spend === 'insufficient_credits') error(402, 'You are out of credits');
	if (spend === 'account_restricted') error(403, 'This account is currently restricted');

	try {
		const turn = await interviewTurn(locals, knowledgeBase, conversation, focus);
		const settledBalance = await settleQuestionUsage(user.id, reserve, interviewSpendReason);
		return json({ ...turn, creditBalance: settledBalance ?? spend.creditBalance });
	} catch (failure) {
		console.error('Interview turn failed', failure);
		await refundQuestionUsage(user.id, reserve, interviewSpendReason);
		error(502, 'That turn failed — your credits have been refunded');
	}
};

async function interviewTurn(
	locals: App.Locals,
	knowledgeBase: { id: string; name: string },
	conversation: InterviewTurnInput[],
	focus: InterviewFocus
): Promise<{ reply: string; harvestedCount: number }> {
	const primary = await findPrimaryExpertiseBrain(locals.supabase, knowledgeBase.id);
	const context = await buildInterviewContext(
		locals.supabase,
		knowledgeBase.id,
		knowledgeBase.name,
		primary
	);
	const turn = await askInterviewer(conversation, context, focus);
	await fileHarvestToKnowledgeBase(locals.supabase, knowledgeBase.id, turn.harvest);
	return {
		reply: turn.reply,
		harvestedCount: turn.harvest.expertiseFacts.length + turn.harvest.experienceEvents.length
	};
}
