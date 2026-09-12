import { error, json } from '@sveltejs/kit';
import { askModeller } from '$lib/server/brain/askModeller';
import { createBrainConversation } from '$lib/server/brain/createBrainConversation';
import { getBrainContexts } from '$lib/server/brain/getBrainContexts';
import { getBrainPageIndex } from '$lib/server/brain/getBrainPageIndex';
import { getDomainBrain } from '$lib/server/entities/getDomainBrain';
import { recordBrainEvent } from '$lib/server/brain/recordBrainEvent';
import { recordConversationTurn } from '$lib/server/brain/recordConversationTurn';
import { rememberedTurns } from '$lib/server/brain/rememberedTurns';
import type { SupabaseClient } from '@supabase/supabase-js';
import { longestQuestion } from '$lib/data/questionLimits';
import { questionFloorCreditsFor } from '$lib/data/creditPricing';
import { refundQuestionUsage } from '$lib/server/credits/refundQuestionUsage';
import { requireSpendHeadroom } from '$lib/server/credits/requireSpendHeadroom';
import { resolveRequestModel } from '$lib/server/anthropic/resolveRequestModel';
import { settleQuestionUsage } from '$lib/server/credits/settleQuestionUsage';
import { spendCredits } from '$lib/server/credits/spendCredits';
import type { RequestHandler } from './$types';

export const config = { maxDuration: 300 };

const questionSpendReason = 'brain_question';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) error(401, 'Sign in to talk to your expertise brain');

	const payload = await request.json();
	const question = readQuestion(payload);
	const brain = await getDomainBrain(locals.supabase, readBrainId(payload));
	if (brain === null) error(404, 'That expertise brain could not be found');
	await requireSpendHeadroom(locals.supabase, user.id);
	const reserve = questionFloorCreditsFor(await resolveRequestModel());
	const spend = await spendCredits(locals.supabase, reserve, questionSpendReason);
	if (spend === 'insufficient_credits') error(402, 'You are out of credits');
	if (spend === 'account_restricted') error(403, 'This account is currently restricted');

	try {
		const conversationId = await resolveConversationId(locals.supabase, brain.id, payload.conversationId);
		const priorTurns = await rememberedTurns(locals.supabase, conversationId);
		const contexts = await getBrainContexts(locals.supabase, brain.id);
		const index = await getBrainPageIndex(locals.supabase, brain.id);
		const answer = await askModeller(locals.supabase, brain.id, contexts, index, [
			...priorTurns,
			{ speaker: 'user', text: question }
		]);
		await recordConversationTurn(locals.supabase, conversationId, question, answer);
		await recordBrainEvent(locals.supabase, {
			brainId: brain.id,
			kind: 'question_answered',
			detail: {
				question,
				answerMarkdown: answer.answerMarkdown,
				citedSlugs: answer.citedSlugs,
				conversationId
			}
		});
		const settledBalance = await settleQuestionUsage(user.id, reserve, questionSpendReason);
		return json({ conversationId, ...answer, creditBalance: settledBalance ?? spend.creditBalance });
	} catch (failure) {
		console.error('Brain question failed', failure);
		await refundQuestionUsage(user.id, reserve, questionSpendReason);
		error(502, 'That question failed — your credits have been refunded');
	}
};

function readQuestion(payload: { question?: unknown }): string {
	const question = typeof payload.question === 'string' ? payload.question.trim() : '';
	if (question === '') error(400, 'A question is required');
	return question.slice(0, longestQuestion);
}

function readBrainId(payload: { brainId?: unknown }): string {
	const brainId = typeof payload.brainId === 'string' ? payload.brainId : '';
	if (brainId === '') error(400, 'A expertise brain is required');
	return brainId;
}

async function resolveConversationId(
	supabase: SupabaseClient,
	brainId: string,
	candidate: unknown
): Promise<string> {
	if (typeof candidate === 'string' && candidate !== '') {
		const { data } = await supabase
			.from('brain_conversations')
			.select('id')
			.eq('id', candidate)
			.eq('brain_id', brainId)
			.maybeSingle();
		if (data !== null) return data.id;
	}
	return createBrainConversation(supabase, brainId, 'brain');
}
