import { error, json } from '@sveltejs/kit';
import { answerBrainQuestion } from '$lib/server/knowledge/brainQuery';
import { questionFloorCreditsFor } from '$lib/data/creditPricing';
import { resolveRequestModel } from '$lib/server/anthropic/resolveRequestModel';
import { settleQuestionUsage } from '$lib/server/credits/settleQuestionUsage';
import { getBrainItems } from '$lib/server/knowledge/getBrainItems';
import { getKbBrain } from '$lib/server/knowledge/getKbBrain';
import { refundQuestionUsage } from '$lib/server/credits/refundQuestionUsage';
import { requireSpendHeadroom } from '$lib/server/credits/requireSpendHeadroom';
import { spendCredits } from '$lib/server/credits/spendCredits';
import { isAnthropicConfigured } from '$lib/server/anthropic/isAnthropicConfigured';
import { longestQuestion } from '$lib/data/questionLimits';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 120 };

const questionSpendReason = 'brain_question';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to query a brain');
	if (!isAnthropicConfigured()) error(503, 'Answers are offline right now — try again shortly');

	const { brainId, question } = await readQuestionRequest(request);
	const brain = await getKbBrain(locals.supabase, brainId);
	if (brain === null) error(404, 'That brain could not be found');
	await requireSpendHeadroom(locals.supabase, user.id);

	const reserve = questionFloorCreditsFor(await resolveRequestModel());
	const spend = await spendCredits(locals.supabase, reserve, questionSpendReason);
	if (spend === 'insufficient_credits') error(402, 'You are out of credits');
	if (spend === 'account_restricted') error(403, 'This account is currently restricted');

	try {
		const items = await getBrainItems(locals.supabase, brain.id);
		const reply = await answerBrainQuestion(brain, items, question);
		const settledBalance = await settleQuestionUsage(user.id, reserve, questionSpendReason);
		return json({ reply, creditBalance: settledBalance ?? spend.creditBalance });
	} catch (failure) {
		console.error('Brain question failed', failure);
		await refundQuestionUsage(user.id, reserve, questionSpendReason);
		error(502, 'That question failed — your credits have been refunded');
	}
};

async function readQuestionRequest(
	request: Request
): Promise<{ brainId: string; question: string }> {
	const payload = await request.json();
	const brainId = typeof payload.brainId === 'string' ? payload.brainId : '';
	const question =
		typeof payload.question === 'string' ? payload.question.trim().slice(0, longestQuestion) : '';
	if (brainId === '' || question === '') error(400, 'A brain and a question are required');
	return { brainId, question };
}
